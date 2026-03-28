import orderSubject from '../notification/OrderSubject.js';
import { OrderBuilder } from './order.builder.js';

// Facade to orchestrate order flow
export class OrderFacade {
  constructor(store, factory) { 
    this.store = store; 
    this.factory = factory;
  }

  createOrder({ userId, items, extraSauce, noOnions, lessSugar, customRequests = [] }) {
    const builder = new OrderBuilder().setUser(userId);
    
    // Facade now internally coordinates the Factory and Decorator subsystems
    for (const it of items || []) {
      let food = this.factory.create(it.type || it.foodType || (it.foodId === 1 ? 'pizza' : it.foodId === 2 ? 'burger' : 'drink'));
      
      if (it.options && Array.isArray(it.options)) {
        food = this.factory.applyOptions(food, it.options);
      }

      builder.addItem({
        foodId: food.id, name: food.name, price: food.price, 
        quantity: Number(it.quantity || 1), options: it.options || []
      });
    }

    // Step-by-step Builder configuration avoids telescoping constructor
    if (extraSauce) builder.withExtraSauce();
    if (noOnions) builder.withoutOnions();
    if (lessSugar) builder.withLessSugar();
    
    const reqs = Array.isArray(customRequests) ? customRequests : [customRequests];
    for (const req of reqs) builder.addCustomRequest(req);

    const order = builder.build();
    this.store.save(order);
    orderSubject.notify('ORDER_CREATED', { orderId: order.id, userId });
    return order;
  }

  updateStatus(orderId, next = false, targetStatus = null) {
    const order = this.store.get(orderId);
    if (!order) throw new Error('Order not found');

    if (next) {
      order.advance();
    } else if (targetStatus) {
      order.transitionTo(String(targetStatus).toLowerCase());
    }
    this.store.save(order);
    orderSubject.notify('ORDER_STATUS_CHANGED', { orderId: order.id, status: order.status() });
    if (order.status() === 'completed') {
      orderSubject.notify('ORDER_DONE', { orderId: order.id });
    }
    return order;
  }

  cancelOrder(orderId) {
    const order = this.store.get(orderId);
    if (!order) throw new Error('Order not found');
    order.cancel(); // Will throw an error if state doesn't allow cancelling
    this.store.save(order);
    orderSubject.notify('ORDER_CANCELLED', { orderId: order.id, status: order.status() });
    return order;
  }
}