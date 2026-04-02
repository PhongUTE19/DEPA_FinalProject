
import { IObserver } from './IObserver.js';
import { NotificationService } from './NotificationService.js';
import { NotificationMessageFactory } from './NotificationMessageFactory.js';

export class KitchenNotifier extends IObserver {
    update(event, data) {
        const message = NotificationMessageFactory.build(event, data, 'kitchen');
        if (!message) return;

        NotificationService.createRecord({
            user_id: null,
            order_id: data.orderId ?? null,
            type: 'kitchen',
            event,
            message,
        }).catch((err) => console.error('[KitchenNotifier] DB error:', err));
    }
}

