
import { CartService } from '../services/cart/CartService.js';
import { OrderService } from '../services/order/OrderService.js';

const CartController = {

    // GET /cart
    showCartPage(req, res) {
        const cart = CartService.getCart(req.session);
        return res.render('pages/cart/index', {
            title: 'Giỏ hàng',
            cart,
            isEmpty: cart.items.length === 0,
        });
    },

    // POST /cart/add  — body: { foodId, quantity, toppingKeys[] }
    async addItem(req, res, next) {
        try {
            const { foodId, quantity = 1, toppingKeys = [] } = req.body;
            if (!foodId) return res.status(400).json({ success: false, message: 'foodId là bắt buộc' });

            const keys = Array.isArray(toppingKeys) ? toppingKeys : [toppingKeys].filter(Boolean);
            const cart = await CartService.addItem(req.session, { foodId, quantity, toppingKeys: keys });

            return res.json({ success: true, cart });
        } catch (err) {
            if (err.message.startsWith('Không tìm thấy')) {
                return res.status(404).json({ success: false, message: err.message });
            }
            next(err);
        }
    },

    // PATCH /cart/update — body: { cartItemId, quantity }
    updateItem(req, res, next) {
        try {
            const { cartItemId, quantity } = req.body;
            if (!cartItemId) return res.status(400).json({ success: false, message: 'cartItemId là bắt buộc' });

            const cart = CartService.updateItem(req.session, { cartItemId, quantity: Number(quantity) });
            return res.json({ success: true, cart });
        } catch (err) { next(err); }
    },

    // DELETE /cart/remove/:id
    removeItem(req, res, next) {
        try {
            const cart = CartService.removeItem(req.session, req.params.id);
            return res.json({ success: true, cart });
        } catch (err) { next(err); }
    },

    // DELETE /cart/clear
    clearCart(req, res) {
        CartService.clearCart(req.session);
        return res.json({ success: true });
    },

    // POST /cart/checkout
    async checkout(req, res, next) {
        try {
            const userId = req.session?.authUser?.id ?? null;
            const items = CartService.toOrderItems(req.session);

            const order = await OrderService.createOrder(items, userId);

            // Save pending order ID — cart will be cleared after payment
            req.session.pendingOrderId = order.id;

            return res.redirect(`/payment/${order.id}`);
        } catch (err) {
            if (err.message === 'Giỏ hàng trống') {
                return res.redirect('/cart');
            }
            next(err);
        }
    },
};

export default CartController;