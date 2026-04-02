/**
 * IObserver — Observer Pattern (interface)
 *
 * Mọi observer phải implement update(event, data).
 * event: string khớp với NOTIFICATION_EVENT.*
 * data:  plain object { orderId, userId, status?, transactionId?, amount?, ... }
 */
export class IObserver {
    /**
     * @param {string} event
     * @param {object} data
     */
    update(event, data) {
        throw new Error('update() must be implemented by subclass');
    }
}
