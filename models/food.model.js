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
	async getByIds(ids = []) {
		const normalized = [...new Set(ids.map(Number).filter(Number.isFinite))];
		if (normalized.length === 0) return [];
		return await baseQuery().whereIn('id', normalized);
	},
};

export default FoodModel;