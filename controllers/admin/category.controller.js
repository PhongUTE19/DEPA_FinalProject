import categoryService from '../../services/category.service.js';

const showListPage = async (req, res) => {
    const categories = await categoryService.findAll();
    res.render('pages/admin/category/list', {
        categories
    });
};

const showAddPage = (req, res) => {
    res.render('pages/admin/category/add');
};

const showEditPage = async (req, res) => {
    const category = await categoryService.findById(req.query.id);
    if (!category) return res.redirect('/admin/category/list');

    res.render('pages/admin/category/edit', {
        category
    });
};

const add = async (req, res) => {
    await categoryService.add(req.body);
    res.render('pages/admin/category/add');
};

const edit = async (req, res) => {
    await categoryService.edit(req.body.id, req.body);
    res.redirect('/admin/category/list');
};

const del = async (req, res) => {
    await categoryService.del(req.body.id);
    res.redirect('/admin/category/list');
};

export default {
    showListPage,
    showAddPage,
    showEditPage,
    add,
    edit,
    del
};
