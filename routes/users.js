var User = require('../models/user').User;
var mongoose = require('../libs/mongoose');
var async = require('async');

exports.list = function(req, res) {
    async.series([
        // find all users
        function(callback) {
            var usersList = [];
            User.find({}, function(err, users) {
                users.forEach(function(user) {
                    usersList.push([user["username"], user["winner"], user["loser"]]);
                });
                callback(null, usersList);
            });
        }
    ], function(err, results) {
        if (err) {
            throw err;
        }

        // render page with all users
        var listOfUsers = results[0];
        res.render('users', {
            title: 'Players',
            user: {name: req.session.username, avatar: req.session.avatar},
            list: listOfUsers
        });
    });
};
