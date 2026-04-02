﻿import { OrderService } from '../services/order/OrderService.js';

export const OrderController = {

    async createOrder(req, res) {
        try {
            const { items } = req.body;
            const userId = req.session?.authUser?.id || null;

            if (!items || !Array.isArray(items)) {
                return res.status(400).json({ message: 'Items array is required' });
            }

            const newOrder = await OrderService.createOrder(items, userId);

            return res.status(201).json({
                message: 'Order created successfully',
                order: newOrder.toJSON()
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: error.message });
        }
    },

    async updateStatus(req, res) {
        try {
            const { orderId } = req.body;

            if (!orderId) {
                return res.status(400).json({ message: 'orderId is required' });
            }

            const order = await OrderService.advanceOrderStatus(orderId);

            return res.json({
                message: 'Order status updated successfully',
                orderId: order.id,
                status: order.getStatus()
            });
        } catch (error) {
            if (error.message === 'Order not found') {
                return res.status(404).json({ message: error.message });
            }
            console.error(error);
            return res.status(500).json({ message: error.message });
        }
    }
};