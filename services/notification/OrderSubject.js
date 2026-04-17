import { UserNotifier } from './UserNotifier.js';
import { KitchenNotifier } from './KitchenNotifier.js';

export class OrderSubject {
    constructor() {
        this._observers = [];
    }

    subscribe(observer) { this._observers.push(observer); }
    unsubscribe(observer) { this._observers = this._observers.filter(o => o !== observer); }

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

const orderSubject = new OrderSubject();
orderSubject.subscribe(new UserNotifier());
orderSubject.subscribe(new KitchenNotifier());

export default orderSubject;
