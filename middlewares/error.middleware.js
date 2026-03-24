const notFound = (req, res) => {
    res.status(404).render('pages/error/404');
};

const forbidden = (req, res) => {
    res.status(403).render('pages/error/403');
};


export default {
    notFound,
    forbidden,
};
