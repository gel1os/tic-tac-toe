var User = require('../models/user').User;
var mongoose = require('../libs/mongoose');
var async = require('async');

exports.userDetails = function(req, res) {
    async.series([
        // find all users
        function(callback) {
            User.findOne({username: req.params.name}, function(err, user) {
                callback(null, user);
            });
        }
    ], function(err, results) {
        if (err) {
            throw err;
        }

        var match = results[0];

        if (match) {

            var allowEditing = req.session.username === match.username;
            res.render('user', {
                title: 'User',
                user: req.session.username,
                matchedUser: match,
                edit: allowEditing
            });

        } else {
            res.render('error', {
                title: 'Error',
                user: req.session.username,
                message: 'Sorry, there is no such user',
                status: 404
            });
        }
    });
};

exports.uploadAvatar = function (req, res) {
    console.log(req.body, req.files);
};
