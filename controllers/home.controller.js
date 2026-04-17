import { FoodService } from '../services/food/FoodService.js';

const showHomePage = async (req, res, next) => {
    try {
        const [featured, bestSellers, newest] = await Promise.all([
            FoodService.getFeatured(6),
            FoodService.getBestSellers(6),
            FoodService.getNewest(6),
        ]);

        res.render('pages/common/home', {
            featured:    featured.map(f => f.toJSON()),
            bestSellers: bestSellers.map(f => f.toJSON()),
            newest:      newest.map(f => f.toJSON()),
        });
    } catch (err) {
        next(err);
    }
};

const showFaqsPage = async (req, res) => {
    res.render('pages/common/faqs');
};

const showAboutPage = async (req, res) => {
    res.render('pages/common/about');
};

export default {
    showHomePage,
    showFaqsPage,
    showAboutPage
};
