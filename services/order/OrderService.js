import { Order } from './Order.js';
import OrderModel from '../../models/order.model.js';

function generateOrderId() {
    return `ORD-${Date.now()}`;
}

function restoreState(order, status) {
    if (status === 'cooking') {
        order.nextState();
    } else if (status === 'done') {
        order.nextState();
        order.nextState();
    }
}

export const OrderService = {
    async createOrder(items, userId = null) {
        const order = new Order({
            id: generateOrderId(),
            userId
        });

        for (const item of items) {
            order.addItem(item);
        }

        const totalAmount = order.calculateTotal();

        await OrderModel.create({
            id: order.id,
            userId: order.userId,
            items: order.items,
            status: order.getStatus(),
            totalAmount
        });

        return order;
    },

    async getOrder(orderId) {
        const dbOrder = await OrderModel.findById(orderId);
        if (!dbOrder) throw new Error('Order not found');

        const items = typeof dbOrder.items === 'string'
            ? JSON.parse(dbOrder.items)
            : dbOrder.items;

        const order = new Order({
            id: dbOrder.id,
            userId: dbOrder.user_id,
            items: items || []
        });

        restoreState(order, dbOrder.status);

        return order;
    },

    async advanceOrderStatus(orderId) {
        const order = await this.getOrder(orderId);

        order.nextState();

        const newStatus = order.getStatus();

        await OrderModel.updateStatus(order.id, newStatus);

        return order;
    }
};