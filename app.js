import express from 'express';
import { engine } from 'express-handlebars';
import session from 'express-session';

import errorMiddleware from './middlewares/error.middleware.js';

// Core domain routers - only Payment & Notification
import notificationRouter from './routes/notification.route.js';
import paymentRouter from './routes/payment.route.js';
import helpers from './views/helpers.js';

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

// Parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routers - only payment & notification
app.use('/payment', paymentRouter);
app.use('/notification', notificationRouter);

// Errors
app.use(errorMiddleware.notFound);
app.use(errorMiddleware.forbidden);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


