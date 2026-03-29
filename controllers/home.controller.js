import courseService from '../services/course.service.js';
import faqService from '../services/faq.service.js';
import { CONST } from '../config/constant.js';

const showHomePage = async (req, res) => {
    const courses = await courseService.findAll();
    res.render('pages/common/home', {
        courses: courses.slice(0, CONST.CAROUSEL_ITEMS),
    });
};

const showFaqsPage = async (req, res) => {
    const faqs = await faqService.findAll();
    res.render('pages/common/faqs', {
        faqs,
    });
};


const showAboutPage = async (req, res) => {
    res.render('pages/common/about');
};

export default {
    showHomePage,
    showFaqsPage,
    showAboutPage
};
