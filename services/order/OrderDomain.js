// Builder interface
export class IOrderBuilder {
  addItem(item) { throw new Error('addItem not implemented'); }
  setUser(userId) { throw new Error('setUser not implemented'); }
  build() { throw new Error('build not implemented'); }
}

// Order State base + concrete states
export class OrderState {
  constructor(order) { this.order = order; }
  name() { return 'unknown'; }
  next() { throw new Error('next() not implemented'); }
}

export class PendingState extends OrderState {
  name() { return 'pending'; }
  next() { this.order._setState(new CookingState(this.order)); }
}

export class CookingState extends OrderState {
  name() { return 'cooking'; }
  next() { this.order._setState(new DoneState(this.order)); }
}

export class DoneState extends OrderState {
  name() { return 'done'; }
  next() { return this; }
}

// Order aggregate using State pattern
export class Order {
  constructor({ id, userId, items }) {
    this.id = id;
    this.userId = userId || null;
    this.items = items || [];
    this._state = new PendingState(this);
    this.createdAt = new Date().toISOString();
  }

  status() { return this._state.name(); }

  advance() { this._state.next(); return this.status(); }

  _setState(s) { this._state = s; }

  totalAmount() {
    return this.items.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 1), 0);
  }
}

// Concrete Builder
export class OrderBuilder extends IOrderBuilder {
  constructor() {
    super();
    this._userId = null;
    this._items = [];
  }

  addItem({ foodId, name, price, quantity = 1 }) {
    this._items.push({ foodId, name, price, quantity });
    return this;
  }

  setUser(userId) { this._userId = userId; return this; }

  build() {
    const id = `${Date.now()}-${Math.floor(Math.random()*1000)}`;
    return new Order({ id, userId: this._userId, items: this._items });
  }
}

// Facade to orchestrate order flow
import orderSubject from '../notification/OrderSubject.js';
export class OrderFacade {
  constructor(store) { this.store = store; }

  createOrder({ userId, items }) {
    const builder = new OrderBuilder().setUser(userId);
    for (const it of items || []) builder.addItem(it);
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
      // move forward only
      const desired = String(targetStatus).toLowerCase();
      while (order.status() !== desired && order.status() !== 'done') {
        order.advance();
      }
    }
    this.store.save(order);
    orderSubject.notify('ORDER_STATUS_CHANGED', { orderId: order.id, status: order.status() });
    if (order.status() === 'done') {
      orderSubject.notify('ORDER_DONE', { orderId: order.id });
    }
    return order;
  }
}

// In-memory store (can be swapped with DB later)
export class InMemoryOrderStore {
  constructor() { this._map = new Map(); }
  save(order) { this._map.set(order.id, order); return order; }
  get(id) { return this._map.get(id) || null; }
}
