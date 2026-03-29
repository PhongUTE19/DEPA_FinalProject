
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
                return `Đơn hàng #${data.orderId} đã thanh toán – BẢT ĐẦU CHỉ BIẾN!`;
            case 'ORDER_STATUS_CHANGED':
                if (data.status === 'cooking') {
                    return `Đơn hàng #${data.orderId} đang chỉ biến`;
                }
                if (data.status === 'done') {
                    return `Đơn hàng #${data.orderId} đã xong, sẵn sàng giao`;
                }
                return null;
            case 'ORDER_CANCELLED':
                return `Đơn hàng #${data.orderId} đã bị hủy – dừng chỉ biến`;
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

