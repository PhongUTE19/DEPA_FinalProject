import { Order } from './Order.js';
import OrderModel from '../../models/order.model.js';
import FoodModel from '../../models/food.model.js';
import orderSubject from '../notification/OrderSubject.js';

function generateOrderId() {
    return `ORD-${Date.now()}`;
}

function restoreState(order, status) {
    if (status === 'cooking') {
        order.nextState();
    } else if (status === 'done') {
        order.nextState();
        order.nextState();
    }
}

/**
 * Tạo order domain: resolve giá từ DB (FoodModel), không tin giá từ client.
 */
async function buildOrderFromRequestItems(items, userId) {
    const order = new Order({
        id: generateOrderId(),
        userId
    });

    const foodIds = items.map((i) => i.foodId);
    const foods = await FoodModel.getByIds(foodIds);
    const priceById = new Map(
        foods.map((f) => [Number(f.id), Number(f.basePrice ?? f.price ?? 0)])
    );

    for (const raw of items) {
        const foodId = Number(raw.foodId);
        const unitPrice = priceById.get(foodId);
        if (!Number.isFinite(foodId) || !Number.isFinite(unitPrice)) {
            throw new Error(`Invalid foodId: ${raw.foodId}`);
        }
        order.addItem({
            foodId,
            quantity: Number(raw.quantity || 1),
            unitPrice,
            toppings: raw.toppings || []
        });
    }

    return order;
}

function parseItems(raw) {
    if (!raw) return [];
    const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(arr) ? arr : [];
}

/**
 * Dữ liệu gọn cho trang SSR danh sách đơn.
 */
function rowToOrderListItem(row) {
    const items = parseItems(row.items);
    return {
        id: row.id,
        userId: row.user_id,
        status: row.status,
        totalAmount: Number(row.total_amount || 0),
        createdAt: row.created_at,
        itemCount: items.length,
    };
}

export const OrderService = {
    async listOrdersForView({ limit = 80 } = {}) {
        const rows = await OrderModel.findAll({ limit });
        return rows.map(rowToOrderListItem);
    },

    async createOrder(items, userId = null) {
        const order = await buildOrderFromRequestItems(items, userId);
        const totalAmount = order.calculateTotal();

        await OrderModel.create({
            id: order.id,
            userId: order.userId,
            items: order.items,
            status: order.getStatus(),
            totalAmount
        });

        orderSubject.notify('ORDER_CREATED', { orderId: order.id, userId: order.userId });
        return order;
    },

    async getOrder(orderId) {
        const dbOrder = await OrderModel.findById(orderId);
        if (!dbOrder) throw new Error('Order not found');

        const items = typeof dbOrder.items === 'string'
            ? JSON.parse(dbOrder.items)
            : dbOrder.items;

        const order = new Order({
            id: dbOrder.id,
            userId: dbOrder.user_id,
            items: items || []
        });

        restoreState(order, dbOrder.status);

        return order;
    },

    async advanceOrderStatus(orderId) {
        const order = await this.getOrder(orderId);

        order.nextState();

        const newStatus = order.getStatus();

        await OrderModel.updateStatus(order.id, newStatus);

        orderSubject.notify('ORDER_STATUS_CHANGED', {
            orderId: order.id,
            userId: order.userId,
            status: newStatus
        });
        if (newStatus === 'done') {
            orderSubject.notify('ORDER_DONE', { orderId: order.id, userId: order.userId });
        }

        return order;
    }
};
