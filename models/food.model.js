import db from '../config/database.js';

const FoodModel = {
  async findAll() {
    return db('foods').select('*').orderBy('id', 'asc');
  },

  async findById(id) {
    return db('foods').where({ id: Number(id) }).first();
  },

  async create(food) {
    const [newFood] = await db('foods')
      .insert({
        ...food,
        created_at: new Date(),
      })
      .returning('*');
    return newFood;
  },
};

export default FoodModel;