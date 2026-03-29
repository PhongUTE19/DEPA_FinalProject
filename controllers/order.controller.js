﻿﻿﻿import { InMemoryOrderStore } from '../services/order/order.store.js';
import { OrderFacade } from '../services/order/order.facade.js';
import { sharedFoodFactory as factory } from '../services/food/food.factory.js';
import OrderModel from '../models/order.model.js';

const store = new InMemoryOrderStore();
const facade = new OrderFacade(store, factory);

const OrderController = {
  async create(req, res, next) {
    try {
      const order = await facade.createOrder(req.body || {});
      res.status(201).json({ orderId: order.id, status: order.status() });
    } catch (err) { next(err); }
  },

  async updateStatus(req, res, next) {
    try {
      const { orderId, next: advanceNext = true, status = null } = req.body || {};
      if (!orderId) return res.status(400).json({ message: 'orderId is required' });
      const order = await facade.updateStatus(orderId, Boolean(advanceNext), status);
      res.json({ orderId: order.id, status: order.status() });
    } catch (err) { next(err); }
  },

  async cancel(req, res, next) {
    try {
      const order = await facade.cancelOrder(req.params.id);
      res.json({ orderId: order.id, status: order.status() });
    } catch (err) { next(err); }
  },

  async quickReorder(req, res, next) {
    try {
      const { id } = req.params;
      const oldOrder = await facade._getOrder(id);
      if (!oldOrder) return res.status(404).json({ message: 'Original order not found' });

      const items = oldOrder.items.map(it => ({
        foodId:   it.foodId,
        quantity: it.quantity,
        options:  it.options || []
      }));

      const newOrder = await facade.createOrder({
        userId: req.body.userId || oldOrder.userId,
        items,
        customRequests: oldOrder.customizations
      });

      res.status(201).json({ orderId: newOrder.id, status: newOrder.status() });
    } catch (err) { next(err); }
  },

  async getById(req, res) {
    try {
      const order = await facade._getOrder(req.params.id);
      res.json({ id: order.id, status: order.status(), items: order.items, customizations: order.customizations, totalAmount: order.totalAmount() });
    } catch (err) {
      if (err.message === 'Order not found') return res.status(404).json({ message: 'Not found' });
      res.status(500).json({ message: err.message });
    }
  },

  async list(req, res, next) {
    try {
      const dbOrders = await OrderModel.findAll();
      const orders = dbOrders.map(o => {
        const items = typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []);
        const customizations = typeof o.customizations === 'string' ? JSON.parse(o.customizations) : (o.customizations || []);
        return {
          id: o.id, status: o.status, items, customizations, totalAmount: Number(o.total_amount)
        };
      });
      res.json(orders);
    } catch (err) { next(err); }
  }
};

export default OrderController;