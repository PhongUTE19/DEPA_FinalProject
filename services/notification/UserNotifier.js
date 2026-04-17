import { IObserver } from './IObserver.js';
import { NotificationService } from './NotificationService.js';
import { NotificationMessageFactory } from './NotificationMessageFactory.js';
import { NOTIFICATION_TYPE } from './Notification.js';

export class UserNotifier extends IObserver {
    update(event, data) {
        // Chỉ gửi khi có userId (khách vãng lai không nhận thông báo user)
        if (data.userId == null) return;

        const message = NotificationMessageFactory.build(event, data, NOTIFICATION_TYPE.USER);
        if (!message) return;

        NotificationService.createRecord({
            userId: data.userId,
            orderId: data.orderId ?? null,
            type: NOTIFICATION_TYPE.USER,
            event,
            message,
        }).catch(err => console.error('[UserNotifier] DB error:', err));
    }
}
