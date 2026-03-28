import express from 'express';
import { engine } from 'express-handlebars';
import session from 'express-session';
import http from 'http';
import { Server } from 'socket.io';
import { initWebSocket } from './services/notification/websocket.js';

import errorMiddleware from './middlewares/error.middleware.js';

// Core domain routers
import menuRouter from './routes/menu.route.js';
import orderRouter from './routes/order.route.js';

import notificationRouter from './routes/notification.route.js';
import paymentRouter from './routes/payment.route.js';
import helpers from './views/helpers.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server and integrate with Socket.IO
const server = http.createServer(app);
initWebSocket(server);

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

// Routers (only project-related)
app.use('/', menuRouter);
app.use('/', orderRouter);

// New Frontend Routes
app.get('/', (req, res) => res.render('index', { title: 'Food Ordering' }));
app.get('/order-tracking/:orderId', (req, res) => {
  res.render('order', { title: `Tracking Order #${req.params.orderId}`, orderId: req.params.orderId });
});
app.get('/kitchen', (req, res) => res.render('kitchen', { title: 'Kitchen Dashboard' }));

app.use('/payment', paymentRouter);
app.use('/notification', notificationRouter);

// Errors
app.use(errorMiddleware.notFound);
app.use(errorMiddleware.handler);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
