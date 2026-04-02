import { PendingState } from './OrderState.js';

export class Order {
    constructor({ id, userId = null, items = [] }) {
        this.id = id;
        this.userId = userId;
        this.items = items; // [{ foodId, quantity, price, toppings }]
        this.state = new PendingState(this);
    }

    addItem(item) {
        this.items.push({
            foodId: item.foodId,
            quantity: item.quantity || 1,
            price: item.price,
            toppings: item.toppings || []
        });
    }

    calculateTotal() {
        return this.items.reduce((total, item) => {
            return total + item.price * item.quantity;
        }, 0);
    }

    setState(state) {
        this.state = state;
    }

    nextState() {
        this.state.next();
    }

    getStatus() {
        return this.state.getStatus();
    }

    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            items: this.items,
            status: this.getStatus(),
            totalAmount: this.calculateTotal()
        };
    }
}