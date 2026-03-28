
import { IObserver } from './IObserver.js';
import NotificationModel from '../../models/notification.model.js';

export class KitchenNotifier extends IObserver {
    update(event, data) {
        const message = this._buildMessage(event, data);
        if (!message) return;

        console.log(`[KitchenNotifier] ðŸ³ ${message}`);

        NotificationModel.create({ user_id: null, order_id: data.orderId || null, type: 'kitchen', event, message }).catch(err => console.error('[KitchenNotifier] DB error:', err));
    }

    _buildMessage(event, data) {
        switch (event) {
            case 'ORDER_PAID':
                return `ÄÆ¡n hÃ ng #${data.orderId} Ä‘Ã£ thanh toÃ¡n â€” Báº®T Äáº¦U CHáº¾ BIáº¾N!`;
            case 'ORDER_STATUS_CHANGED':
                if (data.status === 'cooking') {
                    return `ÄÆ¡n hÃ ng #${data.orderId} Ä‘ang cháº¿ biáº¿n`;
                }
                if (data.status === 'done') {
                    return `ÄÆ¡n hÃ ng #${data.orderId} Ä‘Ã£ xong, sáºµn sÃ ng giao`;
                }
                return null;
            case 'ORDER_CANCELLED':
                return `ÄÆ¡n hÃ ng #${data.orderId} Ä‘Ã£ bá»‹ há»§y â€” dá»«ng cháº¿ biáº¿n`;
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

