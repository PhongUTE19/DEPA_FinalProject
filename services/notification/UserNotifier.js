
import { IObserver } from './IObserver.js';
import NotificationModel from '../../models/notification.model.js';

export class UserNotifier extends IObserver {
    update(event, data) {
        const message = this._buildMessage(event, data);
        if (!message) return;

        console.log(`[UserNotifier] ${message}`);

        // LÆ°u notification vÃ o DB (khÃ´ng cháº·n main flow)
        NotificationModel.create({ user_id: data.userId || null, order_id: data.orderId || null, type: 'user', event, message }).catch(err => console.error('[UserNotifier] DB error:', err));
    }

    _buildMessage(event, data) {
        switch (event) {
            case 'ORDER_CREATED':
                return `ÄÆ¡n hÃ ng #${data.orderId} cá»§a báº¡n Ä‘Ã£ Ä‘Æ°á»£c táº¡o thÃ nh cÃ´ng!`;
            case 'ORDER_PAID':
                return `Thanh toÃ¡n Ä‘Æ¡n hÃ ng #${data.orderId} thÃ nh cÃ´ng. MÃ£ GD: ${data.transactionId}`;
            case 'ORDER_STATUS_CHANGED':
                return `ÄÆ¡n hÃ ng #${data.orderId} Ä‘Ã£ chuyá»ƒn sang tráº¡ng thÃ¡i: ${data.status}`;
            case 'ORDER_DONE':
                return `ÄÆ¡n hÃ ng #${data.orderId} Ä‘Ã£ hoÃ n thÃ nh. Cáº£m Æ¡n báº¡n!`;
            default:
                return null;
        }
    }

    async _save(payload) {
        await db('notifications').insert({
            ...payload,
            created_at: new Date(),
        });
    }
}

