/**
 * OrderService — Facade Pattern
 *
 * Điểm vào duy nhất cho mọi thao tác Order.
 * Controller chỉ gọi OrderService.
 *
 * Lưu ý về id:
 *   orders.id là SERIAL (int4) — DB tự sinh.
 *   Sau OrderModel.create(), id được gán từ row trả về.
 */
import { Order } from './Order.js';
import OrderModel from '../../models/order.model.js';
import FoodModel from '../../models/food.model.js';
import orderSubject from '../notification/OrderSubject.js';
import { ORDER_STATUS } from './OrderState.js';

// ── Helpers ────────────────────────────────────────────────────────────────

function rowToOrder(row) {
    const rawItems = typeof row.items === 'string'
        ? JSON.parse(row.items)
        : (row.items ?? []);

    const order = new Order({
        id: row.id,          // integer từ DB
        userId: row.user_id,
        items: rawItems,
        createdAt: row.created_at,
    });
    order.restoreFromStatus(row.status);
    return order;
}

function rowToListItem(row) {
    const items = typeof row.items === 'string'
        ? JSON.parse(row.items)
        : (row.items ?? []);
    return {
        id: row.id,
        userId: row.user_id,
        status: row.status,
        totalAmount: Number(row.total_amount || 0),
        createdAt: row.created_at,
        itemCount: items.length,
    };
}

// ── Service ────────────────────────────────────────────────────────────────

export const OrderService = {

    async listOrdersForView({ limit = 80, userId } = {}) {
        const rows = await OrderModel.findAll({ limit, userId });
        return rows.map(rowToListItem);
    },

    async getOrder(orderId) {
        const row = await OrderModel.findById(orderId);
        if (!row) throw new Error('Order not found');
        return rowToOrder(row);
    },

    async createOrder(items, userId = null) {
        if (!Array.isArray(items) || items.length === 0) {
            throw new Error('Items array is required and must not be empty');
        }

        // 1. Lấy giá từ DB — không tin giá client gửi lên
        const foodIds = [...new Set(items.map(i => Number(i.foodId)).filter(Number.isFinite))];
        const rows = await FoodModel.getByIds(foodIds);
        const priceMap = new Map(
            rows.map(r => [Number(r.id), Number(r.base_price ?? r.basePrice ?? 0)])
        );

        // 2. Build Order domain (id = null, chưa lưu DB)
        const order = new Order({ userId });
        for (const raw of items) {
            const foodId = Number(raw.foodId);
            if (!Number.isFinite(foodId)) throw new Error(`foodId không hợp lệ: ${raw.foodId}`);

            const unitPrice = priceMap.get(foodId);
            if (unitPrice === undefined) throw new Error(`Không tìm thấy món có id: ${foodId}`);

            order.addItem({
                foodId,
                name: raw.name,
                quantity: Number(raw.quantity) || 1,
                unitPrice,
                toppings: Array.isArray(raw.toppings) ? raw.toppings : [],
            });
        }

        // 3. Lưu DB — id do DB sinh (SERIAL), gán lại vào domain object
        const savedRow = await OrderModel.create({
            userId: order.userId,
            items: order.items,
            status: order.getStatus(),
            totalAmount: order.calculateTotal(),
        });
        order.id = savedRow.id;          // gán integer id từ DB
        order.createdAt = savedRow.created_at;

        // 4. Observer
        orderSubject.notify('ORDER_CREATED', { orderId: order.id, userId: order.userId });

        return order;
    },

    async advanceOrderStatus(orderId) {
        const order = await this.getOrder(orderId);
        order.nextState();
        await OrderModel.updateStatus(order.id, order.getStatus());

        orderSubject.notify('ORDER_STATUS_CHANGED', {
            orderId: order.id,
            userId: order.userId,
            status: order.getStatus(),
        });

        if (order.getStatus() === ORDER_STATUS.COMPLETED) {
            orderSubject.notify('ORDER_COMPLETED', { orderId: order.id, userId: order.userId });
        }

        return order;
    },

    async cancelOrder(orderId) {
        const order = await this.getOrder(orderId);
        order.cancelOrder();
        await OrderModel.updateStatus(order.id, order.getStatus());
        orderSubject.notify('ORDER_CANCELLED', { orderId: order.id, userId: order.userId });
        return order;
    },
};
