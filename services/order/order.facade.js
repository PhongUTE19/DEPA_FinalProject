import orderSubject from '../notification/OrderSubject.js';
import { OrderBuilder } from './order.builder.js';
import OrderModel from '../../models/order.model.js';

export class OrderFacade {
  constructor(store, factory) {
    this.store = store;
    this.factory = factory;
  }

  async createOrder({ userId, items, extraSauce, noOnions, lessSugar, customRequests = [] }) {
    const builder = new OrderBuilder().setUser(userId);

    for (const it of items || []) {
      // FIX: support type, foodType, or numeric foodId coming from the reorder flow
      const typeOrId = it.type || it.foodType || it.foodId;
      let food = this.factory.create(typeOrId);

      if (it.options && Array.isArray(it.options)) {
        food = this.factory.applyOptions(food, it.options);
      }

      builder.addItem({
        foodId:   food.id,
        name:     food.name,
        price:    food.price,
        quantity: Number(it.quantity || 1),
        options:  it.options || []
      });
    }

    if (extraSauce) builder.withExtraSauce();
    if (noOnions)   builder.withoutOnions();
    if (lessSugar)  builder.withLessSugar();

    const reqs = Array.isArray(customRequests) ? customRequests : [customRequests];
    for (const req of reqs) builder.addCustomRequest(req);

    const order = builder.build();

    // Always save to in-memory store (for real-time operations)
    this.store.save(order);

    // FIX: also persist to DB so payment and notifications can find the order
    // after a server restart. We now await it to ensure it's successfully saved.
    await OrderModel.create({
      id:             order.id,
      userId:         userId || null,
      items:          order.items,
      customizations: order.customizations,
      status:         order.status(),
      totalAmount:    order.totalAmount(),
    });

    orderSubject.notify('ORDER_CREATED', { orderId: order.id, userId });
    return order;
  }

  async _getOrder(orderId) {
    let order = this.store.get(orderId);
    if (!order) {
      const dbOrder = await OrderModel.findById(orderId);
      if (!dbOrder) throw new Error('Order not found');

      const builder = new OrderBuilder().setUser(dbOrder.user_id);
      
      const items = typeof dbOrder.items === 'string' ? JSON.parse(dbOrder.items) : dbOrder.items;
      for (const it of items) builder.addItem(it);

      const customizations = typeof dbOrder.customizations === 'string' ? JSON.parse(dbOrder.customizations) : dbOrder.customizations;
      for (const req of customizations) builder.addCustomRequest(req);

      order = builder.build();
      order.id = dbOrder.id; // Override auto-generated ID with the DB ID
      if (dbOrder.status) order.transitionTo(dbOrder.status); // Restore state
      
      this.store.save(order);
    }
    return order;
  }

  async updateStatus(orderId, next = false, targetStatus = null) {
    // FIX: try in-memory first, then fall back to reconstructing from DB
    const order = await this._getOrder(orderId);

    if (next) {
      order.advance();
    } else if (targetStatus) {
      order.transitionTo(String(targetStatus).toLowerCase());
    }

    this.store.save(order);

    // FIX: sync new status to DB
    await OrderModel.updateStatus(orderId, order.status());

    orderSubject.notify('ORDER_STATUS_CHANGED', { orderId: order.id, status: order.status() });
    if (order.status() === 'completed') {
      orderSubject.notify('ORDER_DONE', { orderId: order.id });
    }
    return order;
  }

  async cancelOrder(orderId) {
    const order = await this._getOrder(orderId);

    order.cancel();
    this.store.save(order);

    // FIX: sync cancellation to DB
    await OrderModel.updateStatus(orderId, order.status());

    orderSubject.notify('ORDER_CANCELLED', { orderId: order.id, status: order.status() });
    return order;
  }
}