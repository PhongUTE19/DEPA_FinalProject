/**
 * OrderService — Facade Pattern
 *
 * Điểm vào duy nhất cho mọi thao tác Order.
 * Controller chỉ gọi OrderService, không gọi OrderModel / FoodModel trực tiếp.
 *
 * Luồng tạo đơn:
 *   1. Gọi FoodModel lấy giá (server-side, không tin giá client gửi lên)
 *   2. Build Order domain với items đã có unitPrice
 *   3. Lưu qua OrderModel (truyền plain data, không truyền domain object)
 *   4. Phát sự kiện ORDER_CREATED qua Observer
 *
 * Luồng load đơn:
 *   1. OrderModel.findById → raw row
 *   2. new Order(…) + restoreFromStatus(row.status) → domain object
 *   3. Trả domain object cho caller
 */
import { Order }        from './Order.js';
import OrderModel       from '../../models/order.model.js';
import FoodModel        from '../../models/food.model.js';
import orderSubject     from '../notification/OrderSubject.js';
import { ORDER_STATUS } from './OrderState.js';

// ── Helpers ────────────────────────────────────────────────────────────────

function generateOrderId() {
    return `ORD-${Date.now()}`;
}

/**
 * Chuyển raw DB row → Order domain (bao gồm restoreState)
 * @param {object} row
 * @returns {Order}
 */
function rowToOrder(row) {
    const rawItems = typeof row.items === 'string' ? JSON.parse(row.items) : (row.items ?? []);
    const order = new Order({
        id:        row.id,
        userId:    row.user_id,
        items:     rawItems,
        createdAt: row.created_at,
    });
    order.restoreFromStatus(row.status);
    return order;
}

/**
 * Chuyển raw row → DTO gọn cho trang danh sách đơn (tránh parse JSON items lớn)
 */
function rowToListItem(row) {
    const items = typeof row.items === 'string' ? JSON.parse(row.items) : (row.items ?? []);
    return {
        id:          row.id,
        userId:      row.user_id,
        status:      row.status,
        totalAmount: Number(row.total_amount || 0),
        createdAt:   row.created_at,
        itemCount:   items.length,
    };
}

// ── Service ────────────────────────────────────────────────────────────────

export const OrderService = {

    /** Lấy danh sách đơn (view SSR) — trả mảng DTO, không trả Order domain */
    async listOrdersForView({ limit = 80, userId } = {}) {
        const rows = await OrderModel.findAll({ limit, userId });
        return rows.map(rowToListItem);
    },

    /**
     * Lấy đơn theo id → Order domain
     * @throws {Error} 'Order not found'
     */
    async getOrder(orderId) {
        const row = await OrderModel.findById(orderId);
        if (!row) throw new Error('Order not found');
        return rowToOrder(row);
    },

    /**
     * Tạo đơn mới
     * @param {Array} items   - [{ foodId, quantity, toppings? }] từ client
     * @param {number|null} userId
     * @returns {Order} domain object đã lưu DB
     */
    async createOrder(items, userId = null) {
        if (!Array.isArray(items) || items.length === 0) {
            throw new Error('Items array is required and must not be empty');
        }

        // 1. Lấy giá từ DB — không tin giá client gửi lên
        const foodIds  = [...new Set(items.map(i => Number(i.foodId)).filter(Number.isFinite))];
        const rows     = await FoodModel.getByIds(foodIds);
        const priceMap = new Map(rows.map(r => [Number(r.id), Number(r.base_price ?? r.basePrice ?? r.price ?? 0)]));

        // 2. Build Order domain
        const order = new Order({ id: generateOrderId(), userId });
        for (const raw of items) {
            const foodId = Number(raw.foodId);
            if (!Number.isFinite(foodId)) throw new Error(`foodId không hợp lệ: ${raw.foodId}`);

            const unitPrice = priceMap.get(foodId);
            if (unitPrice === undefined) throw new Error(`Không tìm thấy món có id: ${foodId}`);

            order.addItem({
                foodId,
                quantity:  Number(raw.quantity) || 1,
                unitPrice,
                toppings:  Array.isArray(raw.toppings) ? raw.toppings : [],
            });
        }

        // 3. Lưu DB — truyền plain data, không truyền domain object
        await OrderModel.create({
            id:          order.id,
            userId:      order.userId,
            items:       order.items,
            status:      order.getStatus(),   // 'PENDING'
            totalAmount: order.calculateTotal(),
        });

        // 4. Observer: thông báo ORDER_CREATED
        orderSubject.notify('ORDER_CREATED', { orderId: order.id, userId: order.userId });

        return order;
    },

    /**
     * Chuyển đơn sang trạng thái tiếp theo (Staff / Chef / Manager)
     * @param {string} orderId
     * @returns {Order} domain object sau khi cập nhật
     */
    async advanceOrderStatus(orderId) {
        const order = await this.getOrder(orderId);

        order.nextState();

        await OrderModel.updateStatus(order.id, order.getStatus());

        orderSubject.notify('ORDER_STATUS_CHANGED', {
            orderId:  order.id,
            userId:   order.userId,
            status:   order.getStatus(),
        });

        if (order.getStatus() === ORDER_STATUS.COMPLETED) {
            orderSubject.notify('ORDER_COMPLETED', { orderId: order.id, userId: order.userId });
        }

        return order;
    },

    /**
     * Huỷ đơn (Customer / Staff / Manager — chỉ khi PENDING hoặc CONFIRMED)
     * @param {string} orderId
     * @returns {Order}
     */
    async cancelOrder(orderId) {
        const order = await this.getOrder(orderId);

        order.cancelOrder(); // throws nếu state không cho phép huỷ

        await OrderModel.updateStatus(order.id, order.getStatus()); // 'CANCELLED'

        orderSubject.notify('ORDER_CANCELLED', { orderId: order.id, userId: order.userId });

        return order;
    },
};
