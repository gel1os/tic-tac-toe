var User = require('../models/user').User;
var mongoose = require('../libs/mongoose');
var session = require('cookie-session');

exports.loginGetQuery = function (req, res, next) {
   res.render('login', { title: 'Login/Register', user: req.session.username });
};

exports.loginPostQuery = function (req, res, next) {

    var username = req.body.username,
        password = req.body.password;

    // validation function
    User.findOne({username: username}, function (err, user) {

        if (user) {

            // user exists

            if (user.checkPassword(password)) {

                //password is correct

                req.session.user = user._id;
                req.session.username = username;
                res.send({});

            } else {

                // password is incorrect

                res.status(403).send({message: "Wrong password!"});

            }

        } else {

            // new user --> register

            var newUser = new User({username: username, password: password});
            newUser.save(function (err) {
                if (err) return next(err);
                req.session.user = newUser._id;
                req.session.username = newUser.username;
                res.send({});
            });

        }
    })
};
