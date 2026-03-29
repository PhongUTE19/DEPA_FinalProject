export class OrderState {
    constructor(order) {
        this.order = order;
    }
    next() {
        throw new Error('next() must be implemented by subclass');
    }
    getStatus() {
        throw new Error('getStatus() must be implemented by subclass');
    }
}

export class PendingState extends OrderState {
    next() {
        this.order.setState(new CookingState(this.order));
    }
    getStatus() {
        return 'pending';
    }
}

export class CookingState extends OrderState {
    next() {
        this.order.setState(new DoneState(this.order));
    }
    getStatus() {
        return 'cooking';
    }
}

export class DoneState extends OrderState {
    next() {
        // Terminal state: Already done, do nothing or throw Error based on needs
        console.log('Order is already done.');
    }
    getStatus() {
        return 'done';
    }
}