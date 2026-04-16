import express from 'express';
import { engine } from 'express-handlebars';
import session from 'express-session';

import homeRouter from './routes/home.route.js';
import accountRouter from './routes/account.route.js';
import foodRouter from './routes/food.route.js';
import orderRouter from './routes/order.route.js';
import notificationRouter from './routes/notification.route.js';
import paymentRouter from './routes/payment.route.js';

import reviewRouter from './routes/review.route.js';
import favoriteRouter from './routes/favorite.route.js';
import cartRouter from './routes/cart.route.js';
import couponRouter from './routes/coupon.route.js';

import helpers from './views/helpers.js';

import viewMiddleware from './middlewares/view.middleware.js';
import errorMiddleware from './middlewares/error.middleware.js';
// import viewMiddleware from './middlewares/view.middleware.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

// Static files
app.use('/public', express.static('public'));

// Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'food-ordering-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' },
}));

// View engine (Handlebars)
app.engine('hbs', engine({
    extname: '.hbs',
    layoutsDir: 'views/layouts',
    partialsDir: 'views/partials',
    helpers
}));

app.set('view engine', 'hbs');
app.set('views', './views');

// Body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Inject auth state vào res.locals cho mọi view
app.use(viewMiddleware.injectAuthState);

app.use((req, res, next) => {
    const items = req.session?.cart?.items ?? [];
    res.locals.cartCount = items.reduce((s, i) => s + i.quantity, 0);
    next();
});

// Routers
app.use('/', homeRouter);
app.use('/account', accountRouter);
app.use('/menu', foodRouter);
app.use('/order', orderRouter);
app.use('/payment', paymentRouter);
app.use('/notification', notificationRouter);
app.use('/coupon', couponRouter);

app.use('/review', reviewRouter);
app.use('/favorite', favoriteRouter);
app.use('/cart', cartRouter);

// Error handlers
app.use(errorMiddleware.notFound);
app.use(errorMiddleware.forbidden);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
