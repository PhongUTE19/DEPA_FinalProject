const notFound = (req, res) => {
    res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
};

const forbidden = (req, res) => {
    res.status(403).json({ message: 'Forbidden' });
};

const handler = (err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: err.message || 'Internal Server Error',
    });
};

export default {
    notFound,
    forbidden,
    handler,
};
