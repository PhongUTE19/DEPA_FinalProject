import courseService from '../../services/course.service.js';

const showListPage = async (req, res) => {
    const courses = await courseService.findAll();
    res.render('pages/admin/course/list', {
        courses
    });
};

const showAddPage = (req, res) => {
    res.render('pages/admin/course/add');
};

const showEditPage = async (req, res) => {
    const course = await courseService.findById(req.query.id);
    if (!course)
        return res.redirect('/admin/course/list');

    res.render('pages/admin/course/edit', {
        course
    });
};

const add = async (req, res) => {
    await courseService.add(req.body);
    res.render('pages/admin/course/add');
};

const edit = async (req, res) => {
    await courseService.edit(req.body.id, req.body);
    res.redirect('/admin/course/list');
};

const del = async (req, res) => {
    await courseService.del(req.body.id);
    res.redirect('/admin/course/list');
};

export default {
    showListPage,
    showAddPage,
    showEditPage,
    add,
    edit,
    del
};
