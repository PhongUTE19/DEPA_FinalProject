import { PendingState } from './order.state.js';

// Order aggregate using State pattern
export class Order {
  constructor({ id, userId, items, customizations }) {
    this.id = id;
    this.userId = userId || null;
    this.items = items || [];
    this.customizations = customizations || [];
    this._state = new PendingState(this);
    this.createdAt = new Date().toISOString();
  }

  status() { return this._state.name(); }

  advance() { this._state.next(); return this.status(); }

  cancel() { this._state.cancel(); return this.status(); }

  transitionTo(targetStatus) { this._state.transitionTo(targetStatus); return this.status(); }

  _setState(s) { this._state = s; }

  totalAmount() {
    return this.items.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 1), 0);
  }
}