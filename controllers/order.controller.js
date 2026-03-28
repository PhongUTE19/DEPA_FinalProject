import { InMemoryOrderStore, OrderFacade } from '../services/order/OrderDomain.js';
import { FoodFactory } from '../services/food/FoodFactory.js';

// A simple module-local store (resets on server restart)
const store = new InMemoryOrderStore();
const facade = new OrderFacade(store);
const factory = new FoodFactory();

const OrderController = {
  // POST /order
  create(req, res, next) {
    try {
      const { items = [], userId = null } = req.body || {};
      // items: [{ foodId, quantity, options? }]
      const enriched = items.map(it => {
        const food = factory.create(it.type || it.foodType || (it.foodId === 1 ? 'pizza' : it.foodId === 2 ? 'burger' : 'drink'));
        return { foodId: food.id, name: food.name, price: food.price, quantity: Number(it.quantity || 1) };
      });
      const order = facade.createOrder({ userId, items: enriched });
      res.status(201).json({ orderId: order.id, status: order.status() });
    } catch (err) { next(err); }
  },

  // PATCH /order/status
  updateStatus(req, res, next) {
    try {
      const { orderId, next = true, status = null } = req.body || {};
      if (!orderId) return res.status(400).json({ message: 'orderId is required' });
      const order = facade.updateStatus(orderId, Boolean(next), status);
      res.json({ orderId: order.id, status: order.status() });
    } catch (err) { next(err); }
  },

  // Utility endpoint (optional): GET /order/:id
  getById(req, res) {
    const { id } = req.params;
    const order = store.get(id);
    if (!order) return res.status(404).json({ message: 'Not found' });
    res.json({ id: order.id, status: order.status(), items: order.items, totalAmount: order.totalAmount() });
  }
};

export default OrderController;
