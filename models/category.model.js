import db from '../config/database.js';

const tableName = 'categories';

const baseQuery = () => db(tableName);

const findAll = () => {
    return baseQuery()
        .orderBy('category_id', 'asc');
};

const findById = (id) => {
    return baseQuery()
        .where('category_id', id).first();
};

const add = (category) => {
    return baseQuery()
        .insert(category);
};

const del = (id) => {
    return baseQuery()
        .where('category_id', id).del();
};

const edit = (id, category) => {
    return baseQuery()
        .where('category_id', id).update(category);
};

export default {
    findAll,
    findById,
    add,
    del,
    edit,
};
