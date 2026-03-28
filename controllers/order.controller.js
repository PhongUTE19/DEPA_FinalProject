﻿import { InMemoryOrderStore } from '../services/order/order.store.js';
import { OrderFacade } from '../services/order/order.facade.js';
import { sharedFoodFactory as factory } from '../services/food/food.factory.js';

const store = new InMemoryOrderStore();
const facade = new OrderFacade(store, factory);

const OrderController = {
  create(req, res, next) {
    try {
      const order = facade.createOrder(req.body || {});
      res.status(201).json({ orderId: order.id, status: order.status() });
    } catch (err) { next(err); }
  },

  updateStatus(req, res, next) {
    try {
      const { orderId, next: advanceNext = true, status = null } = req.body || {};
      if (!orderId) return res.status(400).json({ message: 'orderId is required' });
      const order = facade.updateStatus(orderId, Boolean(advanceNext), status);
      res.json({ orderId: order.id, status: order.status() });
    } catch (err) { next(err); }
  },

  cancel(req, res, next) {
    try {
      const order = facade.cancelOrder(req.params.id);
      res.json({ orderId: order.id, status: order.status() });
    } catch (err) { next(err); }
  },

  quickReorder(req, res, next) {
    try {
      const { id } = req.params;
      const oldOrder = store.get(id);
      if (!oldOrder) return res.status(404).json({ message: 'Original order not found' });

      const items = oldOrder.items.map(it => ({
        foodId:   it.foodId,
        quantity: it.quantity,
        options:  it.options || []
      }));

      const newOrder = facade.createOrder({
        userId: req.body.userId || oldOrder.userId,
        items,
        customRequests: oldOrder.customizations
      });

      res.status(201).json({ orderId: newOrder.id, status: newOrder.status() });
    } catch (err) { next(err); }
  },

  getById(req, res) {
    const order = store.get(req.params.id);
    if (!order) return res.status(404).json({ message: 'Not found' });
    res.json({ id: order.id, status: order.status(), items: order.items, customizations: order.customizations, totalAmount: order.totalAmount() });
  },

  list(req, res) {
    const orders = store.getAll().map(o => ({
      id: o.id, status: o.status(), items: o.items, customizations: o.customizations, totalAmount: o.totalAmount()
    }));
    res.json(orders);
  }
};

export default OrderController;