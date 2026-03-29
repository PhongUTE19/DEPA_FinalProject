import { PaymentAdapter } from '../services/payment/PaymentAdapter.js';
import PaymentModel from '../models/payment.model.js';
import orderSubject from '../services/notification/OrderSubject.js';

const PaymentController = {

  // GET /payment/:orderId
  async showPaymentPage(req, res, next) {
    try {
      const { orderId } = req.params;  // keep as string — don't Number() it
      const userId = Number(req.query.userId || req.session?.authUser?.id || 1);

      // FIX: pass orderId as-is to the model. PaymentModel.findByOrderId must
      // also accept string IDs — see payment.model.js fix below.
      const existing = await PaymentModel.findByOrderId(orderId);
      if (existing) {
        return res.render('payment/result', {
          title: 'Payment Result',
          payment: existing,
          alreadyPaid: true,
        });
      }

      const methods = PaymentAdapter.getAvailableMethods();
      res.render('payment/index', { title: 'Order Payment', orderId, methods, userId });
    } catch (err) {
      next(err);
    }
  },

  // POST /payment
  async processPayment(req, res, next) {
    try {
      const { orderId, paymentMethod, totalAmount, userId } = req.body;

      // FIX: orderId is a timestamp string like "1700000000000-42".
      // Never convert it with Number() — it becomes NaN.
      const result = await PaymentAdapter.process(paymentMethod, {
        orderId,          // pass as string
        totalAmount,
        userId,
      });

      if (!result.success) {
        return res.render('payment/result', {
          title: 'Payment Failed',
          success: false,
          message: result.message,
        });
      }

      const payment = await PaymentModel.create({
        orderId,          // FIX: pass as string
        userId: userId || req.session?.authUser?.id,
        method: result.method,
        transactionId: result.transactionId,
        amount: Number(result.amount || totalAmount || 0),
        status: 'success',
      });

      orderSubject.notify('ORDER_PAID', {
        orderId,
        userId: payment.user_id,
        transactionId: result.transactionId,
        amount: Number(result.amount || totalAmount || 0),
      });

      res.render('payment/result', { title: 'Payment Successful', success: true, payment, result });
    } catch (err) {
      next(err);
    }
  },

  // GET /payment/history
  async paymentHistory(req, res, next) {
    try {
      const userId = Number(req.query.userId || req.session?.authUser?.id || 1);
      const payments = await PaymentModel.findByUserId(userId);
      res.render('payment/history', { title: 'Payment History', payments });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/payment (JSON)
  async apiProcessPayment(req, res, next) {
    try {
      const { orderId, paymentMethod, totalAmount, userId } = req.body;

      if (!orderId || !paymentMethod || !totalAmount) {
        return res.status(400).json({ success: false, message: 'Missing: orderId, paymentMethod, totalAmount' });
      }

      const result = await PaymentAdapter.process(paymentMethod, { orderId, totalAmount, userId });

      if (!result.success) {
        return res.status(402).json({ success: false, message: result.message });
      }

      const payment = await PaymentModel.create({
        orderId,
        userId,
        method: result.method,
        transactionId: result.transactionId,
        amount: Number(result.amount || totalAmount || 0),
        status: 'success',
      });

      orderSubject.notify('ORDER_PAID', {
        orderId,
        userId,
        transactionId: result.transactionId,
        amount: Number(result.amount || totalAmount || 0),
      });

      res.json({ success: true, payment, result });
    } catch (err) {
      next(err);
    }
  },
};

export default PaymentController;