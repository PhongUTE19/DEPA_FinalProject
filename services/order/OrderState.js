/**
 * OrderState — State Pattern
 *
 * Thống nhất status UPPERCASE enum:
 *   PENDING → CONFIRMED → PREPARING → READY → COMPLETED
 *                       ↘ CANCELLED (từ PENDING hoặc CONFIRMED)
 *
 * Mỗi state class tự biết trạng thái kế tiếp.
 * OrderService không cần if/else để chuyển trạng thái.
 */

export const ORDER_STATUS = Object.freeze({
    PENDING:   'PENDING',
    CONFIRMED: 'CONFIRMED',
    PREPARING: 'PREPARING',
    READY:     'READY',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
});

// Map trạng thái string → class để restoreState
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
    next()      { /* no-op: terminal state */ }
    cancel()    { throw new Error('Cannot cancel a completed order'); }
    getStatus() { return ORDER_STATUS.COMPLETED; }
}

export class CancelledState extends OrderState {
    next()      { /* no-op: terminal state */ }
    cancel()    { /* already cancelled */ }
    getStatus() { return ORDER_STATUS.CANCELLED; }
}

// Populate map after class definitions
STATUS_CLASS_MAP[ORDER_STATUS.PENDING]   = PendingState;
STATUS_CLASS_MAP[ORDER_STATUS.CONFIRMED] = ConfirmedState;
STATUS_CLASS_MAP[ORDER_STATUS.PREPARING] = PreparingState;
STATUS_CLASS_MAP[ORDER_STATUS.READY]     = ReadyState;
STATUS_CLASS_MAP[ORDER_STATUS.COMPLETED] = CompletedState;
STATUS_CLASS_MAP[ORDER_STATUS.CANCELLED] = CancelledState;

/**
 * Khôi phục state từ string lưu trong DB.
 * @param {Order} order
 * @param {string} status - giá trị từ DB
 */
export function restoreState(order, status) {
    const normalized = (status || '').toUpperCase();
    const StateClass  = STATUS_CLASS_MAP[normalized] ?? PendingState;
    order.setState(new StateClass(order));
}
