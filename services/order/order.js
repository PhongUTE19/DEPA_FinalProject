import { PendingState } from './OrderState.js';

export class Order {
    constructor({ id, userId = null, items = [] }) {
        this.id = id;
        this.userId = userId;
        this.items = items; // [{ foodId, quantity, unitPrice, toppings }]
        this.state = new PendingState(this);
    }

    addItem(item) {
        const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
        this.items.push({
            foodId: item.foodId,
            quantity: item.quantity || 1,
            unitPrice,
            toppings: item.toppings || []
        });
    }

    calculateTotal() {
        return this.items.reduce((total, item) => {
            const unit = Number(item.unitPrice ?? item.price ?? 0);
            return total + unit * item.quantity;
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