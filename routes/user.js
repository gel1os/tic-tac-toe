var User = require('../models/user').User;
var mongoose = require('../libs/mongoose');
var session = require('cookie-session');
var async = require('async');
var fs = require('fs');

exports.userDetails = function (req, res) {
    async.series([
        // find user
        function (callback) {
            User.findOne({username: req.params.name}, function (err, user) {
                callback(null, user);
            });
        }
    ], function (err, results) {
        if (err) {
            res.render('error', {
                title: 'Error',
                user: {name: req.session.username, avatar: req.session.avatar},
                message: 'Sorry, there is no such user',
                status: 404
            });
        }

        var match = results[0];

        if (match) {

            var allowEditing = req.session.username === match.username;

            function getRegistrationDate(date) {
                var dd = date.getDate(),
                    mm = date.getMonth() + 1, //January is 0!
                    yyyy = date.getFullYear();

                if (dd < 10) {
                    dd = '0' + dd;
                }

                if (mm < 10) {
                    mm = '0' + mm;
                }

                date = dd + '.' + mm + '.' + yyyy;
                return date
            }

            function countEfficiency(wins, loses) {

                var efficiency = Math.round((wins / (wins + loses)) * 100);

                return isNaN(efficiency) ? 0 : efficiency;
            }

            var userData = {
                username: match.username,
                registered: getRegistrationDate(match.created),
                avatar: match.avatar,
                efficiency: countEfficiency(match.winner, match.loser),
                loses: match.loser,
                wins: match.winner
            };

            res.render('user', {
                title: 'User',
                user: {name: req.session.username, avatar: req.session.avatar},
                matchedUser: userData,
                edit: allowEditing
            });
        }
    });
};

exports.uploadAvatar = function (file, req, res) {
    async.waterfall([

        function (callback) {
            User.findOne({ username: req.session.username }, function (err, user) {
                if (user) {
                    User.update({_id: user._id}, {$set: { avatar: '/uploads/avatars/' + file.name }}, function (err) {
                        req.session.avatar = '/uploads/avatars/' + file.name;
                        callback(null, user);
                    });
                }
            });
        }
    ], function (err, results) {

        if (err) {
            res.render('error', {
                title: 'Error',
                user: {name: req.session.username, avatar: req.session.avatar},
                message: 'Sorry, there is no such user',
                status: 404
            });
        }

        if (results) {
            res.redirect(req.get('referer'));
        }
    });
};