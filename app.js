import express from 'express';
import { engine } from 'express-handlebars';
import session from 'express-session';
import http from 'http';
import { Server } from 'socket.io';
import { initWebSocket } from './services/notification/websocket.js';
import { sharedFoodFactory } from './services/food/food.factory.js';

import errorMiddleware from './middlewares/error.middleware.js';

import menuRouter from './routes/menu.route.js';
import orderRouter from './routes/order.route.js';
import notificationRouter from './routes/notification.route.js';
import paymentRouter from './routes/payment.route.js';
import helpers from './views/helpers.js';

const app = express();
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
initWebSocket(server);

app.set('trust proxy', 1);

app.use('/public', express.static('public'));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.engine('hbs', engine({
  extname: '.hbs',
  layoutsDir: 'views/layouts',
  partialsDir: 'views/partials',
  helpers
}));
app.set('view engine', 'hbs');
app.set('views', './views');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', menuRouter);
app.use('/', orderRouter);

app.get('/', (req, res) => res.render('index', { title: 'Food Ordering' }));
app.get('/order-tracking/:orderId', (req, res) => {
  res.render('order', { title: `Tracking Order #${req.params.orderId}`, orderId: req.params.orderId });
});
app.get('/kitchen', (req, res) => res.render('kitchen', { title: 'Kitchen Dashboard' }));

app.use('/payment', paymentRouter);
app.use('/notification', notificationRouter);

app.use(errorMiddleware.notFound);
app.use(errorMiddleware.handler);

// FIX: Load the food catalog from the DB before accepting requests.
// If the DB is unavailable the factory keeps its hardcoded fallback catalog
// and the app still starts — it just serves the 3 default items.
sharedFoodFactory.loadFromDB().then(() => {
  console.log('[App] Food catalog loaded.');
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('[App] Startup error:', err);
  process.exit(1);
});