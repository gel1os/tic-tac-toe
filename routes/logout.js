var session = require('cookie-session');

exports.logout = function(req, res, next) {
    req.session = null;
    res.status(200).send({});
};