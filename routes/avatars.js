var session = require('cookie-session');
var fs = require('fs');
var async = require('async');

exports.avatars = function (req, res) {

    async.waterfall([
        function (callback) {
            var filePath = './uploads/avatars';

            var dive = function (dir) {
                fs.readdir(dir, function (err, list) {
                    if (err) return;

                    callback(null, list);
                });
            };

            dive(filePath);
        }
    ], function (err, results) {

        if (err || !results.length) {
            res.render('error', {
                title: 'Error',
                user: {name: req.session.username, avatar: req.session.avatar},
                message: 'Sorry, there is no such user',
                status: 404
            });
        }
        
        if (results.length) {
            res.render('avatars', {
                title: 'Avatars',
                user: {name: req.session.username, avatar: req.session.avatar},
                avatars: results
            });
        }
    });
};