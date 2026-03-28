import orderSubject from '../notification/OrderSubject.js';
import { OrderBuilder } from './order.builder.js';
import OrderModel from '../../models/order.model.js';

export class OrderFacade {
  constructor(store, factory) {
    this.store = store;
    this.factory = factory;
  }

  createOrder({ userId, items, extraSauce, noOnions, lessSugar, customRequests = [] }) {
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
    // after a server restart. Fire-and-forget — don't block the HTTP response.
    OrderModel.create({
      id:             order.id,
      userId:         userId || null,
      items:          order.items,
      customizations: order.customizations,
      status:         order.status(),
      totalAmount:    order.totalAmount(),
    }).catch(err => console.error('[OrderFacade] DB persist error:', err.message));

    orderSubject.notify('ORDER_CREATED', { orderId: order.id, userId });
    return order;
  }

  updateStatus(orderId, next = false, targetStatus = null) {
    // FIX: try in-memory first, then fall back to reconstructing from DB
    let order = this.store.get(orderId);
    if (!order) throw new Error('Order not found');

    if (next) {
      order.advance();
    } else if (targetStatus) {
      order.transitionTo(String(targetStatus).toLowerCase());
    }

    this.store.save(order);

    // FIX: sync new status to DB
    OrderModel.updateStatus(orderId, order.status())
      .catch(err => console.error('[OrderFacade] DB status update error:', err.message));

    orderSubject.notify('ORDER_STATUS_CHANGED', { orderId: order.id, status: order.status() });
    if (order.status() === 'completed') {
      orderSubject.notify('ORDER_DONE', { orderId: order.id });
    }
    return order;
  }

  cancelOrder(orderId) {
    const order = this.store.get(orderId);
    if (!order) throw new Error('Order not found');

    order.cancel();
    this.store.save(order);

    // FIX: sync cancellation to DB
    OrderModel.updateStatus(orderId, order.status())
      .catch(err => console.error('[OrderFacade] DB cancel error:', err.message));

    orderSubject.notify('ORDER_CANCELLED', { orderId: order.id, status: order.status() });
    return order;
  }
}