import { Order } from './Order.js';

export class IOrderBuilder {
    addItem(item) {
        throw new Error('addItem() must be implemented');
    }
    build() {
        throw new Error('build() must be implemented');
    }
}

export class OrderBuilder extends IOrderBuilder {
    constructor() {
        super();
        this.reset();
    }

    reset() {
        // Simple unique ID generation
        const newId = `ORD-${Date.now()}`;
        this.order = new Order(newId);
    }

    addItem(item) {
        // Minimal implementation: relies only on foodId and quantity
        this.order.items.push({
            foodId: item.foodId,
            quantity: item.quantity || 1
        });
        return this;
    }

    build() {
        const builtOrder = this.order;
        this.reset(); // Prepare for next build if reused
        return builtOrder;
    }
}