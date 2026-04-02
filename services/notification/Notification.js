export class Notification {
    constructor({
        id,
        userId,
        orderId,
        type,
        event,
        message,
        isRead,
        createdAt,
    }) {
        this.id = id;
        this.userId = userId;
        this.orderId = orderId;
        this.type = type;
        this.event = event;
        this.message = message;
        this.isRead = isRead ?? false;
        this.createdAt = createdAt ?? new Date();
    }

    static fromRow(row) {
        if (!row) return null;
        return new Notification({
            id: row.id,
            userId: row.user_id,
            orderId: row.order_id,
            type: row.type,
            event: row.event,
            message: row.message,
            isRead: row.is_read,
            createdAt: row.created_at,
        });
    }

    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            orderId: this.orderId,
            type: this.type,
            event: this.event,
            message: this.message,
            isRead: this.isRead,
            createdAt: this.createdAt,
        };
    }
}