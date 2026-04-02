/**
 * OrderController
 *
 * Chỉ nhận req → gọi OrderService → gọi .toJSON() → trả res.
 * KHÔNG import OrderModel, Order, OrderState trực tiếp.
 */
import { OrderService } from '../services/order/OrderService.js';

export const OrderController = {

    // GET /order — trang danh sách đơn (SSR)
    async showOrdersPage(req, res, next) {
        try {
            const userId = req.session?.authUser?.id ?? null;
            // Staff/Chef/Manager xem tất cả; Customer xem đơn của mình
            const opts = req.session?.authUser?.role === 'CUSTOMER'
                ? { limit: 50, userId }
                : { limit: 100 };

            const orders = await OrderService.listOrdersForView(opts);
            return res.render('pages/order/index', {
                title: 'Đơn hàng',
                orders,
            });
        } catch (err) {
            next(err);
        }
    },

    // GET /order/:id — lấy đơn (JSON)
    async showOrderPage(req, res, next) {
        try {
            const order = await OrderService.getOrder(req.params.id);
            return res.json({ success: true, order: order.toJSON() });
        } catch (err) {
            if (err.message === 'Order not found') {
                return res.status(404).json({ success: false, message: err.message });
            }
            next(err);
        }
    },

    // POST /order — tạo đơn (JSON)
    async createOrder(req, res, next) {
        try {
            const { items } = req.body;
            if (!Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ success: false, message: 'items array is required' });
            }

            const userId   = req.session?.authUser?.id ?? null;
            const newOrder = await OrderService.createOrder(items, userId);

            return res.status(201).json({
                success: true,
                message: 'Đặt hàng thành công',
                order:   newOrder.toJSON(),
            });
        } catch (err) {
            if (err.message.startsWith('Không tìm thấy món') || err.message.startsWith('foodId')) {
                return res.status(400).json({ success: false, message: err.message });
            }
            next(err);
        }
    },

    // PATCH /order/status — chuyển trạng thái kế tiếp (Staff / Chef / Manager)
    async updateStatus(req, res, next) {
        try {
            const { orderId } = req.body;
            if (!orderId) {
                return res.status(400).json({ success: false, message: 'orderId là bắt buộc' });
            }

            const order = await OrderService.advanceOrderStatus(orderId);
            return res.json({
                success:  true,
                message:  'Cập nhật trạng thái thành công',
                orderId:  order.id,
                status:   order.getStatus(),
            });
        } catch (err) {
            if (err.message === 'Order not found') {
                return res.status(404).json({ success: false, message: err.message });
            }
            next(err);
        }
    },

    // PATCH /order/cancel — huỷ đơn (Customer / Staff / Manager)
    async cancelOrder(req, res, next) {
        try {
            const { orderId } = req.body;
            if (!orderId) {
                return res.status(400).json({ success: false, message: 'orderId là bắt buộc' });
            }

            const order = await OrderService.cancelOrder(orderId);
            return res.json({
                success:  true,
                message:  'Đơn hàng đã được huỷ',
                orderId:  order.id,
                status:   order.getStatus(),
            });
        } catch (err) {
            if (err.message === 'Order not found') {
                return res.status(404).json({ success: false, message: err.message });
            }
            if (err.message.startsWith('Cannot cancel')) {
                return res.status(409).json({ success: false, message: err.message });
            }
            next(err);
        }
    },
};
