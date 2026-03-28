
import { UserNotifier } from './UserNotifier.js';
import { KitchenNotifier } from './KitchenNotifier.js';

export class OrderSubject {
    constructor() {
        this._observers = [];
    }

    // Subscribe observer
    subscribe(observer) {
        this._observers.push(observer);
    }

    // Unsubscribe observer
    unsubscribe(observer) {
        this._observers = this._observers.filter(o => o !== observer);
    }

    // Notify all observers
    notify(event, data) {
        console.log(`[OrderSubject] Notifying event: ${event}`);
        for (const observer of this._observers) {
            try {
                observer.update(event, data);
            } catch (err) {
                console.error(`[OrderSubject] Observer error:`, err);
            }
        }
    }
}


const orderSubject = new OrderSubject();
orderSubject.subscribe(new UserNotifier());
orderSubject.subscribe(new KitchenNotifier());

export default orderSubject;