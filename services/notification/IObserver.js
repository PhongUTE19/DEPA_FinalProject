/**
 * IObserver — Observer Pattern (interface)
 *
 * Mọi observer phải implement update(event, data).
 *   event: tên sự kiện — 'ORDER_CREATED', 'ORDER_STATUS_CHANGED', 'ORDER_PAID', ...
 *   data:  plain object { orderId, userId, status?, transactionId?, amount? }
 */
export class IObserver {
    update(event, data) {
        throw new Error('update() must be implemented by subclass');
    }
}
