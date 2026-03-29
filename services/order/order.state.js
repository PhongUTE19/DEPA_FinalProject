// All state classes go here as they are tightly coupled.

export class OrderState {
  constructor(order) { this.order = order; }
  name() { return 'unknown'; }
  next() { throw new Error('next() not implemented'); }
  cancel() { throw new Error(`Cannot cancel an order that is in ${this.name()} state.`); }
  transitionTo(targetStatus) {
    if (this.name() === targetStatus) return;
    throw new Error(`Illegal State Transition: Cannot move from ${this.name()} directly to ${targetStatus}.`);
  }
}

export class PendingState extends OrderState {
  name() { return 'pending'; }
  next() { this.order._setState(new CookingState(this.order)); }
  cancel() { this.order._setState(new CancelledState(this.order)); }
  transitionTo(targetStatus) {
    if (targetStatus === 'cooking') return this.next();
    if (targetStatus === 'cancelled') return this.cancel();
    if (targetStatus === 'completed') throw new Error('Illegal State Transition: Cannot complete an order before cooking.');
    super.transitionTo(targetStatus);
  }
}

export class CookingState extends OrderState {
  name() { return 'cooking'; }
  next() { this.order._setState(new DeliveryState(this.order)); }
  transitionTo(targetStatus) {
    if (targetStatus === 'delivery') return this.next();
    if (targetStatus === 'cancelled') return this.cancel(); // Will throw the base class error!
    super.transitionTo(targetStatus);
  }
}

export class DeliveryState extends OrderState {
  name() { return 'delivery'; }
  next() { this.order._setState(new CompletedState(this.order)); }
  transitionTo(targetStatus) {
    if (targetStatus === 'completed') return this.next();
    super.transitionTo(targetStatus);
  }
}

export class CompletedState extends OrderState {
  name() { return 'completed'; }
  next() { return this; }
}

export class CancelledState extends OrderState {
  name() { return 'cancelled'; }
  next() { return this; }
}