import express from 'express';
import { engine } from 'express-handlebars';
import session from 'express-session';

import homeRouter from './routes/home.route.js';
import accountRouter from './routes/account.route.js';
import foodRouter from './routes/food.route.js';
import orderRouter from './routes/order.route.js';
import notificationRouter from './routes/notification.route.js';
import paymentRouter from './routes/payment.route.js';
import helpers from './views/helpers.js';

// import authMiddleware from './middlewares/auth.middleware.js';
import errorMiddleware from './middlewares/error.middleware.js';
// import viewMiddleware from './middlewares/view.middleware.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

// Static
app.use('/public', express.static('public'));

// Session (kept for compatibility; views not required for APIs)
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// View engine (optional; APIs do not require but kept per README)
app.engine('hbs', engine({ extname: '.hbs', layoutsDir: 'views/layouts', partialsDir: 'views/partials', helpers }));
app.set('view engine', 'hbs');
app.set('views', './views');

// 4. Body parsers: Place these before routes to parse into req.body
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

// 6. Routers
app.use('/', homeRouter);
app.use("/account", accountRouter);
app.use("/menu", foodRouter);
app.use("/order", orderRouter);
app.use('/payment', paymentRouter);
app.use('/notification', notificationRouter);

// 8. Error handling middleware
app.use(errorMiddleware.notFound);
app.use(errorMiddleware.forbidden);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
