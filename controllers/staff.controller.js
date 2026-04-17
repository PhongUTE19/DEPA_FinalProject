import { OrderService } from '../services/order/OrderService.js';

export const StaffController = {

    // GET /staff — danh sách tất cả đơn hàng
    async showOrdersPage(req, res, next) {
        try {
            const orders = await OrderService.listOrdersForView({ limit: 200 });
            return res.render('pages/staff/orders', {
                title: 'Quản lý đơn hàng',
                orders,
            });
        } catch (err) {
            next(err);
        }
    },

    // PATCH /staff/order/status — chuyển trạng thái kế tiếp
    async advanceStatus(req, res, next) {
        try {
            const { orderId } = req.body;
            if (!orderId) {
                return res.status(400).json({ success: false, message: 'orderId là bắt buộc' });
            }
            const order = await OrderService.advanceOrderStatus(orderId);
            return res.json({
                success: true,
                message: 'Cập nhật trạng thái thành công',
                orderId: order.id,
                status: order.getStatus(),
            });
        } catch (err) {
            if (err.message === 'Order not found') {
                return res.status(404).json({ success: false, message: err.message });
            }
            next(err);
        }
    },

    // PATCH /staff/order/cancel — huỷ đơn
    async cancelOrder(req, res, next) {
        try {
            const { orderId } = req.body;
            if (!orderId) {
                return res.status(400).json({ success: false, message: 'orderId là bắt buộc' });
            }
            const order = await OrderService.cancelOrder(orderId);
            return res.json({
                success: true,
                message: 'Đã huỷ đơn hàng',
                orderId: order.id,
                status: order.getStatus(),
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
