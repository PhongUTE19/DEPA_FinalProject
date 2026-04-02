import { IObserver } from './IObserver.js';
import { NotificationService } from './NotificationService.js';
import { NotificationMessageFactory } from './NotificationMessageFactory.js';

export class UserNotifier extends IObserver {
    update(event, data) {
        const message = NotificationMessageFactory.build(event, data, 'user');
        if (!message) return;

        NotificationService.createRecord({
            user_id: data.userId ?? null,
            order_id: data.orderId ?? null,
            type: 'user',
            event,
            message,
        }).catch((err) => console.error('[UserNotifier] DB error:', err));
    }
}

