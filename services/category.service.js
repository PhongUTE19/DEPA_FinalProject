import categoryModel from '../models/category.model.js';

const findAll = async () => {
    return categoryModel.findAll();
};

const findById = async (id) => {
    return categoryModel.findById(id);
};

const add = async (data) => {
    const category = {
        name: data.name,
        description: data.description
    };
    return categoryModel.add(category);
};

const edit = async (id, data) => {
    const category = {
        name: data.name,
        description: data.description
    };
    return categoryModel.edit(id, category);
};

const del = async (id) => {
    return categoryModel.del(id);
};

export default {
    findAll,
    findById,
    add,
    edit,
    del
};
