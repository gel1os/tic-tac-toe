var session = require('cookie-session');
var login = require('../routes/login');
var logout = require('../routes/logout');
var usersList = require('../routes/users');
var user = require('../routes/user');
var avatars = require('../routes/avatars');

exports.main = function(req, res, next) {
    var userObj = {
            name: req.session.username,
            avatar: req.session.avatar
        },
        forbidden = userObj.name ? false : true;
    res.render('index', { title: 'Tic-tac-toe', user: userObj, forbidden: forbidden});
};

exports.loginGetQuery = function (req, res, next) {
    login.loginGetQuery(req, res, next);
};

exports.loginPostQuery = function (req, res, next) {
    login.loginPostQuery(req, res, next);
};

exports.logout = function (req, res, next) {
    logout.logout(req, res, next);
};

exports.list = function (req, res, next) {
    usersList.list(req, res, next);
};

exports.userInfo = function (req, res, next) {
    user.userDetails(req, res, next);
};

exports.uploadAvatar = function (file, req, res, next) {
    user.uploadAvatar(file, req, res, next);
};

exports.avatars = function (req, res) {
    avatars.avatars(req, res);
};

