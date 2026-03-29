import db from '../config/database.js';

const tableName = 'food';

const baseQuery = () => db(tableName);

const FoodModel = {
  async getAll() {
    return await baseQuery();
  },
  async getById(id) {
    return await baseQuery().where({ id }).first();
  },
};

export default FoodModel;