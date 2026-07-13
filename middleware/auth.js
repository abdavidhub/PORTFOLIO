
function requireAuth(req, res, next) {
    if (req.session && req.session.estAdmin) {
        return next();
    }
    res.redirect('/admin/login');
}

module.exports = { requireAuth };