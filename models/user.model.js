import db from '../config/database.js';

const tableName = 'users';

const baseQuery = () => db(tableName);

const findByUsername = (username) => {
    return baseQuery()
        .where('username', username)
        .first();
};

const add = (user) => {
    return baseQuery()
        .insert(user);
};

const edit = (id, user) => {
    return baseQuery()
        .where('id', id)
        .update(user);
};

export default {
    add,
    findByUsername,
    edit,
};
