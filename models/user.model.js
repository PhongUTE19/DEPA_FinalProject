import db from '../config/database.js';

const UserModel = {
  async findById(id) {
    return db('users').where({ id: Number(id) }).first();
  },

  async findByEmail(email) {
    return db('users').where({ email }).first();
  },

  async create(user) {
    const [newUser] = await db('users')
      .insert({
        ...user,
        created_at: new Date(),
      })
      .returning('*');
    return newUser;
  },
};

export default UserModel;