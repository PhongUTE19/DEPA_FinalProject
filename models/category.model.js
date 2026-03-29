import db from '../config/database.js';

const findAll = async () => {
    // Get distinct types from the food table instead of a categories table
    const results = await db('food').distinct('type').whereNotNull('type');
    
    // Map them to objects so the rest of your app doesn't break
    return results.map((row, index) => ({
        category_id: index + 1,
        name: row.type
    }));
};

const findById = async (id) => {
    return null; // Stub: Since categories don't have real IDs anymore
};

const add = async (category) => {
    // Stub: Cannot add a standalone category if it's just a food type
    return null;
};

const del = async (id) => {
    // Stub
    return null;
};

const edit = async (id, category) => {
    // Stub
    return null;
};

export default {
    findAll,
    findById,
    add,
    del,
    edit,
};
