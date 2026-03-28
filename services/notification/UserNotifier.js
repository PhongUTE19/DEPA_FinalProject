﻿﻿﻿
import { IObserver } from './IObserver.js';
import { getIo, isUserOnline } from './websocket.js';
import NotificationModel from '../../models/notification.model.js';

export class UserNotifier extends IObserver {
    update(event, data) {
        const message = this._buildMessage(event, data);
        if (!message) return;

        console.log(`[UserNotifier] ${message}`);

        // Alternate Flow: Offline Customer Fallback
        const isOnline = isUserOnline(data.userId);
        if (isOnline) {
            const io = getIo();
            console.log(`[WebSocket] Broadcasting to room ${data.orderId}: ${message}`);
            io.to(data.orderId).emit('order_status_update', { status: data.status, message });
        } else {
            console.log(`[Email/SMS Service] User ${data.userId} offline. Falling back to Email/SMS: ${message}`);
        }

        // Save notification to DB (non-blocking).
        // Explicitly set order_id to null to prevent Postgres integer out-of-range errors.
        NotificationModel.create({ user_id: data.userId || null, order_id: null, type: 'user', event, message }).catch(err => console.error('[UserNotifier] DB error:', err));
    }

    _buildMessage(event, data) {
        switch (event) {
            case 'ORDER_CREATED':
                return `Your order #${data.orderId} has been successfully created!`;
            case 'ORDER_PAID':
                return `Payment for order #${data.orderId} successful. TXN: ${data.transactionId}`;
            case 'ORDER_STATUS_CHANGED':
                return `Order #${data.orderId} status changed to: ${data.status}`;
            case 'ORDER_DONE':
                return `Order #${data.orderId} is completed. Thank you!`;
            default:
                return null;
        }
    }
}
