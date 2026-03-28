
import { IObserver } from './IObserver.js';
import db from '../../config/database.js';

export class KitchenNotifier extends IObserver {
    update(event, data) {
        const message = this._buildMessage(event, data);
        if (!message) return;

        console.log(`[KitchenNotifier] 🍳 ${message}`);

        this._save({
            user_id: null,
            order_id: data.orderId || null,
            type: 'kitchen',
            event,
            message,
        }).catch(err => console.error('[KitchenNotifier] DB error:', err));
    }

    _buildMessage(event, data) {
        switch (event) {
            case 'ORDER_PAID':
                return `Đơn hàng #${data.orderId} đã thanh toán — BẮT ĐẦU CHẾ BIẾN!`;
            case 'ORDER_STATUS_CHANGED':
                if (data.status === 'cooking') {
                    return `Đơn hàng #${data.orderId} đang chế biến`;
                }
                if (data.status === 'done') {
                    return `Đơn hàng #${data.orderId} đã xong, sẵn sàng giao`;
                }
                return null;
            case 'ORDER_CANCELLED':
                return `Đơn hàng #${data.orderId} đã bị hủy — dừng chế biến`;
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
