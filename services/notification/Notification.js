/**
 * Notification Domain Object
 *
 * Thống nhất:
 *   - type:  'USER' | 'KITCHEN'   (UPPERCASE)
 *   - event: 'ORDER_CREATED' | 'ORDER_CONFIRMED' | 'ORDER_PREPARING' |
 *            'ORDER_READY' | 'ORDER_COMPLETED' | 'ORDER_CANCELLED' |
 *            'PAYMENT_SUCCESS' | 'PAYMENT_FAILED'
 *   - isRead (thay cho isSeen cũ)
 */

export const NOTIFICATION_TYPE = Object.freeze({
    USER:    'USER',
    KITCHEN: 'KITCHEN',
});

export const NOTIFICATION_EVENT = Object.freeze({
    ORDER_CREATED:   'ORDER_CREATED',
    ORDER_CONFIRMED: 'ORDER_CONFIRMED',
    ORDER_PREPARING: 'ORDER_PREPARING',
    ORDER_READY:     'ORDER_READY',
    ORDER_COMPLETED: 'ORDER_COMPLETED',
    ORDER_CANCELLED: 'ORDER_CANCELLED',
    PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
    PAYMENT_FAILED:  'PAYMENT_FAILED',
});

export class Notification {
    /**
     * @param {object} params
     * @param {number}        [params.id]
     * @param {number|null}   [params.userId]   - null cho KITCHEN
     * @param {string|null}   [params.orderId]
     * @param {string}        params.type       - NOTIFICATION_TYPE.*
     * @param {string}        params.event      - NOTIFICATION_EVENT.*
     * @param {string}        params.message
     * @param {boolean}       [params.isRead]
     * @param {Date}          [params.createdAt]
     */
    constructor({ id = null, userId = null, orderId = null, type, event, message, isRead = false, createdAt = null }) {
        this.id        = id;
        this.userId    = userId;
        this.orderId   = orderId;
        this.type      = type;
        this.event     = event;
        this.message   = message;
        this.isRead    = Boolean(isRead);
        this.createdAt = createdAt ?? new Date();
    }

    /** DB row → Notification domain */
    static fromRow(row) {
        if (!row) return null;
        return new Notification({
            id:        row.id,
            userId:    row.user_id,
            orderId:   row.order_id,
            type:      (row.type || '').toUpperCase(),
            event:     row.event,
            message:   row.message,
            isRead:    row.is_read ?? false,
            createdAt: row.created_at,
        });
    }

    toJSON() {
        return {
            id:        this.id,
            userId:    this.userId,
            orderId:   this.orderId,
            type:      this.type,
            event:     this.event,
            message:   this.message,
            isRead:    this.isRead,
            createdAt: this.createdAt,
        };
    }
}
