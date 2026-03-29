
import { IObserver } from './IObserver.js';
import NotificationModel from '../../models/notification.model.js';

export class UserNotifier extends IObserver {
    update(event, data) {
        const message = this._buildMessage(event, data);
        if (!message) return;

        console.log(`[UserNotifier] ${message}`);

        // Lưu notification vào DB (không chặn main flow)
        NotificationModel.create({ user_id: data.userId || null, order_id: data.orderId || null, type: 'user', event, message }).catch(err => console.error('[UserNotifier] DB error:', err));
    }

    _buildMessage(event, data) {
        switch (event) {
            case 'ORDER_CREATED':
                return `Đơn hàng #${data.orderId} của bạn đã được tạo thành công!`;
            case 'ORDER_PAID':
                return `Thanh toán đơn hàng #${data.orderId} thành công. Mã GD: ${data.transactionId}`;
            case 'ORDER_STATUS_CHANGED':
                return `Đơn hàng #${data.orderId} đã chuyển sang trạng thái: ${data.status}`;
            case 'ORDER_DONE':
                return `Đơn hàng #${data.orderId} đã hoàn thành. Cảm ơn bạn!`;
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

