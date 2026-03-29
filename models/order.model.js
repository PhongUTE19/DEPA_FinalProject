import db from '../config/database.js';

const OrderModel = {
  async findById(orderId) {
    return db('orders').where({ id: String(orderId) }).first();
  },
};

export default OrderModel;

