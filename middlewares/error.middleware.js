/**
 * Error Middleware
 *
 * notFound  — 404 handler
 * forbidden — 403 handler
 * handler   — generic error handler (đặt cuối cùng trong app.js)
 */

const notFound = (req, res) => {
    res.status(404).render('pages/error/404');
};

const forbidden = (req, res) => {
    res.status(403).render('pages/error/403');
};

/** Generic error handler — nhận 4 tham số nên Express nhận ra là error middleware */
// eslint-disable-next-line no-unused-vars
const handler = (err, req, res, next) => {
    console.error('[Error]', err.message, err.stack);
    const status = err.status || 500;
    if (req.accepts('json')) {
        return res.status(status).json({ success: false, message: err.message || 'Internal server error' });
    }
    res.status(status).render('pages/error/500', { message: err.message });
};

export default { notFound, forbidden, handler };
