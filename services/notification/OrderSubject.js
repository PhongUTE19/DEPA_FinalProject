/**
 * OrderSubject — Observer Pattern (Subject / Publisher)
 *
 * Singleton: export default orderSubject
 * OrderService và PaymentService gọi orderSubject.notify(event, data).
 * UserNotifier và KitchenNotifier là observer mặc định.
 *
 * data object chuẩn:
 *   { orderId: string, userId: number|null, status?: string,
 *     transactionId?: string, amount?: number }
 */
import { UserNotifier }    from './UserNotifier.js';
import { KitchenNotifier } from './KitchenNotifier.js';

export class OrderSubject {
    constructor() {
        this._observers = [];
    }

    subscribe(observer) {
        this._observers.push(observer);
    }

    unsubscribe(observer) {
        this._observers = this._observers.filter(o => o !== observer);
    }

    /**
     * Phát sự kiện tới tất cả observer đang đăng ký.
     * @param {string} event
     * @param {object} data
     */
    notify(event, data) {
        console.log(`[OrderSubject] → ${event}`, { orderId: data.orderId, userId: data.userId });
        for (const observer of this._observers) {
            try {
                observer.update(event, data);
            } catch (err) {
                console.error(`[OrderSubject] Observer error (${observer.constructor.name}):`, err.message);
            }
        }
    }
}

// Singleton — mọi service dùng chung instance này
const orderSubject = new OrderSubject();
orderSubject.subscribe(new UserNotifier());
orderSubject.subscribe(new KitchenNotifier());

export default orderSubject;
