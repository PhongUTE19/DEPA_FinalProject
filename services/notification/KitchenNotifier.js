﻿
import { IObserver } from './IObserver.js';
import NotificationModel from '../../models/notification.model.js';

export class KitchenNotifier extends IObserver {
    update(event, data) {
        const message = this._buildMessage(event, data);
        if (!message) return;

        console.log(`[KitchenNotifier] 🍳 ${message}`);

        NotificationModel.create({ user_id: null, order_id: data.orderId || null, type: 'kitchen', event, message }).catch(err => console.error('[KitchenNotifier] DB error:', err));
    }

    _buildMessage(event, data) {
        switch (event) {
            case 'ORDER_PAID':
                return `Order #${data.orderId} is paid - START COOKING!`;
            case 'ORDER_STATUS_CHANGED':
                if (data.status === 'cooking') {
                    return `Order #${data.orderId} is cooking`;
                }
                if (data.status === 'done') {
                    return `Order #${data.orderId} is done, ready for delivery`;
                }
                return null;
            case 'ORDER_CANCELLED':
                return `Order #${data.orderId} is cancelled - stop cooking`;
            default:
                return null;
        }
    }
}
