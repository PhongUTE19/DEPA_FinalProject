﻿import { InMemoryOrderStore } from '../services/order/order.store.js';
import { OrderFacade } from '../services/order/order.facade.js';
import { FoodFactory } from '../services/food/FoodFactory.js';

// A simple module-local store (resets on server restart)
const store = new InMemoryOrderStore();
const factory = new FoodFactory();
// We inject the Factory subsystem into the Facade
const facade = new OrderFacade(store, factory);

const OrderController = {
  // POST /order
  create(req, res, next) {
    try {
      // The Controller is now completely dumb. It just passes the raw request body to the Facade!
      const order = facade.createOrder(req.body || {});
      res.status(201).json({ orderId: order.id, status: order.status() });
    } catch (err) { next(err); }
  },

  // PATCH /order/status
  updateStatus(req, res, next) {
    try {
      // Rename the extracted 'next' property to 'advanceNext' to avoid shadowing the Express next() function
      const { orderId, next: advanceNext = true, status = null } = req.body || {};
      if (!orderId) return res.status(400).json({ message: 'orderId is required' });
      const order = facade.updateStatus(orderId, Boolean(advanceNext), status);
      res.json({ orderId: order.id, status: order.status() });
    } catch (err) { next(err); }
  },

  // POST /order/:id/cancel
  cancel(req, res, next) {
    try {
      const { id } = req.params;
      const order = facade.cancelOrder(id);
      res.json({ orderId: order.id, status: order.status() });
    } catch (err) { next(err); }
  },

  // POST /order/:id/reorder
  quickReorder(req, res, next) {
    try {
      const { id } = req.params;
      const oldOrder = store.get(id); // Using memory store per current setup
      if (!oldOrder) return res.status(404).json({ message: 'Original order not found' });

      // Alternate Flow: Extract exact past configuration and use Builder/Facade to reconstruct
      const items = oldOrder.items.map(it => ({
        foodId: it.foodId,
        quantity: it.quantity,
        options: it.options || []
      }));

      const newOrder = facade.createOrder({
        userId: req.body.userId || oldOrder.userId,
        items,
        customRequests: oldOrder.customizations
      });

      res.status(201).json({ orderId: newOrder.id, status: newOrder.status() });
    } catch (err) { next(err); }
  },

  // Utility endpoint (optional): GET /order/:id
  getById(req, res) {
    const { id } = req.params;
    const order = store.get(id);
    if (!order) return res.status(404).json({ message: 'Not found' });
    res.json({ id: order.id, status: order.status(), items: order.items, totalAmount: order.totalAmount() });
  },

  // GET /order (List all for Kitchen MVP)
  list(req, res) {
    const orders = store.getAll().map(o => ({
      id: o.id, status: o.status(), items: o.items, totalAmount: o.totalAmount()
    }));
    res.json(orders);
  }
};

export default OrderController;
