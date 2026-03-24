import courseService from '../services/course.service.js';

const showListPage = async (req, res) => {
    const data = await courseService.queryList(req.query);
    res.render('pages/course/list', data);
};

const showDetailPage = async (req, res) => {
    const data = await courseService.queryDetail(req.query.courseId);
    if (!data) return res.redirect('/');
    res.render('pages/course/detail', data);
};

const showListPageBySearch = async (req, res) => {
    const data = await courseService.querySearch(req.query.q);
    res.render('pages/course/list', data);
};

export default {
    showListPage,
    showDetailPage,
    showListPageBySearch
};
