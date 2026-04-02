import db from '../config/database.js';

const tableName = 'orders';

const baseQuery = () => db(tableName);

export const OrderModel = {
    async create(order) {
        const [newOrder] = await baseQuery()
            .insert({
                id: order.id,
                user_id: order.userId || null,
                items: JSON.stringify(order.items),
                status: order.status,
                total_amount: order.totalAmount || 0,
                created_at: new Date()
            })
            .returning('*');
        return newOrder;
    },
    
    async findById(id) {
        return baseQuery().where({ id }).first();
    },
    
    async updateStatus(id, status) {
        const [updated] = await baseQuery()
            .where({ id })
            .update({ status })
            .returning('*');
        return updated;
    }
};

export default OrderModel;
