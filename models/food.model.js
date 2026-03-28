import db from '../config/database.js';

const FoodModel = {
  async getAll() {
    return await db('food').select('id', 'name', 'price', 'type', 'image_url');
  },
  async getById(id) {
    return await db('food').where({ id }).first();
  },
};

export default FoodModel;