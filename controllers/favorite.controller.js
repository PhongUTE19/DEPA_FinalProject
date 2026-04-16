import { FavoriteService } from '../services/favorite/FavoriteService.js';

const FavoriteController = {
    // GET /favorite/
    async getAll(req, res, next) {
        try {
            const foods = await FavoriteService.getByUserId(req.session.authUser.id);
            return res.render('pages/favorite', { foods });
        } catch (err) {
            next(err);
        }
    },
    // POST /favorite/:foodId
    async add(req, res, next) {
        try {
            await FavoriteService.add(req.session.authUser.id, req.params.foodId);
            return res.json({ success: true });
        } catch (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
    },
    // DELETE /favorite/:foodId
    async remove(req, res, next) {
        try {
            await FavoriteService.remove(req.session.authUser.id, req.params.foodId);
            return res.json({ success: true });
        } catch (err) {
            next(err);
        }
    },
};

export default FavoriteController;