import faqModel from '../models/faq.model.js';

const findAll = async () => {
    return faqModel.findAll();
};

export default {
    findAll,
};