import db from '../config/database.js';

const tableName = 'faqs';

const baseQuery = () => db(tableName);

const findAll = () => {
    return baseQuery()
        .orderBy('faq_id', 'asc');
};

const findById = (id) => {
    return baseQuery()
        .where('faq_id', id)
        .first();
};

const add = (faq) => {
    return baseQuery()
        .insert(faq);
};

const del = (id) => {
    return baseQuery()
        .where('faq_id', id)
        .del();
};

const edit = (id, faq) => {
    return baseQuery()
        .where('faq_id', id)
        .update(faq);
};

export default {
    findAll,
    findById,
    add,
    del,
    edit,
};
