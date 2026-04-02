/**
 * KitchenNotifier — Observer Pattern (concrete observer)
 *
 * Lắng nghe sự kiện từ OrderSubject.
 * Gửi thông báo loại 'KITCHEN' → NotificationService (không gọi Model trực tiếp).
 */
import { IObserver }                    from './IObserver.js';
import { NotificationService }          from './NotificationService.js';
import { NotificationMessageFactory }   from './NotificationMessageFactory.js';
import { NOTIFICATION_TYPE }            from './Notification.js';

export class KitchenNotifier extends IObserver {
    update(event, data) {
        const message = NotificationMessageFactory.build(event, data, NOTIFICATION_TYPE.KITCHEN);
        if (!message) return;

        NotificationService.createRecord({
            userId:  null,                      // Thông báo bếp không gắn userId
            orderId: data.orderId ?? null,
            type:    NOTIFICATION_TYPE.KITCHEN,
            event,
            message,
        }).catch(err => console.error('[KitchenNotifier] DB error:', err));
    }
}
