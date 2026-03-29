import { OrderBuilder } from './OrderBuilder.js';
import OrderModel from '../../models/order.model.js';

export const OrderService = {
    async createOrder(items, userId = null) {
        const builder = new OrderBuilder();
        for (const item of items) {
            builder.addItem(item);
        }
        
        const order = builder.build();
        order.userId = userId;
        await OrderModel.create({
            id: order.id,
            userId: order.userId,
            items: order.items,
            status: order.getStatus(),
            totalAmount: 0 
        });
        
        return order;
    },

    async getOrder(orderId) {
        const dbOrder = await OrderModel.findById(orderId);
        if (!dbOrder) throw new Error('Order not found');
        const builder = new OrderBuilder();
                const items = typeof dbOrder.items === 'string' ? JSON.parse(dbOrder.items) : dbOrder.items;
        for (const item of items || []) {
            builder.addItem(item);
        }

        const order = builder.build();
        order.id = dbOrder.id; 
        order.userId = dbOrder.user_id;
        if (dbOrder.status === 'cooking') {
            order.nextState();
        } else if (dbOrder.status === 'done') {
            order.nextState();
            order.nextState();
        }

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