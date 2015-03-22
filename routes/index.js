var gameInfo = require('../middleware/gameInfo');
var session = require('cookie-session');

exports.main = function(req, res, next) {
    var username = req.session.username,
        forbidden = username ? false : true;
    res.render('index', { title: 'Tic-tac-toe', user: username, onlineUsers: gameInfo, forbidden: forbidden});
};


