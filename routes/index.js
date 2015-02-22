var express = require('express');
var router = express.Router();
var User = require('../models/user').User;
var mongoose = require('../libs/mongoose');
var session = require('cookie-session');
var gameInfo = require('../middleware/gameInfo');

router.get('/', function(req, res, next) {
    var username = req.session.username,
        forbidden = username ? false : true;
    res.render('index', { title: 'Tic-tac-toe', user: username, onlineUsers: gameInfo, forbidden: forbidden});
});

router.get('/login', function (req, res, next) {
    res.render('login', { title: 'Login/Register', user: req.session.username });

    //drop data-base
    /*mongoose.connection.collections['users'].drop( function(err) {
        console.log('collection dropped');
    });*/

});

router.post('/login', function (req, res, next) {
    var username = req.body.username,
        password = req.body.password;
    User.findOne({username: username}, function (err, user) {
        if (user) {
            if (user.checkPassword(password)) {
                req.session.user = user._id;
                req.session.username = username;
                res.send({});
            } else {
                res.status(403).send({message: "Wrong password!"});
            }
        } else {
            var newUser = new User({username: username, password: password});
            newUser.save(function (err) {
                if (err) return next(err);
                req.session.user = newUser._id;
                req.session.username = newUser.username;
                res.send({});
            });
        }
    })
});

router.post('/logout', function(req, res, next) {
    req.session = null;
    res.status(200).send({});
});

router.get("/users", function (req, res, next) {
    res.render('users', { title: 'Players', user: req.session.username});
});

router.post('/users', function(req, res, next) {
    var usersList = [];
    User.find({}, function(err, users) {
        users.forEach(function(user) {
            usersList.push(user["username"])
        });
        res.status(200).send(usersList);
    });
});

module.exports = router;