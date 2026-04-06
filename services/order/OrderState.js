/**
 * OrderState — State Pattern
 *
 * Vòng đời đơn hàng:
 *   PENDING → CONFIRMED → PREPARING → READY → COMPLETED
 *           ↘ CANCELLED          ↗ (không thể huỷ từ đây trở đi)
 *
 * Mỗi state class tự biết trạng thái kế tiếp — OrderService không cần if/else.
 */
export const ORDER_STATUS = Object.freeze({
    PENDING:   'PENDING',
    CONFIRMED: 'CONFIRMED',
    PREPARING: 'PREPARING',
    READY:     'READY',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
});

const STATUS_CLASS_MAP = {};

export class OrderState {
    constructor(order) { this.order = order; }
    next()      { throw new Error('next() must be implemented'); }
    cancel()    { throw new Error('cancel() not allowed in this state'); }
    getStatus() { throw new Error('getStatus() must be implemented'); }
}

export class PendingState extends OrderState {
    next()      { this.order.setState(new ConfirmedState(this.order)); }
    cancel()    { this.order.setState(new CancelledState(this.order)); }
    getStatus() { return ORDER_STATUS.PENDING; }
}

export class ConfirmedState extends OrderState {
    next()      { this.order.setState(new PreparingState(this.order)); }
    cancel()    { this.order.setState(new CancelledState(this.order)); }
    getStatus() { return ORDER_STATUS.CONFIRMED; }
}

export class PreparingState extends OrderState {
    next()      { this.order.setState(new ReadyState(this.order)); }
    cancel()    { throw new Error('Cannot cancel order that is already being prepared'); }
    getStatus() { return ORDER_STATUS.PREPARING; }
}

export class ReadyState extends OrderState {
    next()      { this.order.setState(new CompletedState(this.order)); }
    cancel()    { throw new Error('Cannot cancel a ready order'); }
    getStatus() { return ORDER_STATUS.READY; }
}

export class CompletedState extends OrderState {
    next()      { /* terminal */ }
    cancel()    { throw new Error('Cannot cancel a completed order'); }
    getStatus() { return ORDER_STATUS.COMPLETED; }
}

export class CancelledState extends OrderState {
    next()      { /* terminal */ }
    cancel()    { /* already cancelled */ }
    getStatus() { return ORDER_STATUS.CANCELLED; }
}

STATUS_CLASS_MAP[ORDER_STATUS.PENDING]   = PendingState;
STATUS_CLASS_MAP[ORDER_STATUS.CONFIRMED] = ConfirmedState;
STATUS_CLASS_MAP[ORDER_STATUS.PREPARING] = PreparingState;
STATUS_CLASS_MAP[ORDER_STATUS.READY]     = ReadyState;
STATUS_CLASS_MAP[ORDER_STATUS.COMPLETED] = CompletedState;
STATUS_CLASS_MAP[ORDER_STATUS.CANCELLED] = CancelledState;

export function restoreState(order, status) {
    const StateClass = STATUS_CLASS_MAP[(status || '').toUpperCase()] ?? PendingState;
    order.setState(new StateClass(order));
}
