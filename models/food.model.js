import db from '../config/database.js';

const FoodModel = {
  async findAll() {
    return db('food').select('*').orderBy('id', 'asc');
  },

  async findById(id) {
    return db('food').where({ id: Number(id) }).first();
  },

  async create(food) {
    const [newFood] = await db('food')
      .insert({
        ...food,
      })
      .returning('*');
    return newFood;
  },
};

export default FoodModel;