var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('./config');
var mongoose = require('mongoose');
var session = require('cookie-session');
var multer = require('multer');
var fs = require('fs');
var mkdirp = require('mkdirp');
var app = express();
var User = require('./models/user').User;
var async = require('async');

function viewEngineSetup() {
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');

    app.use(favicon(__dirname + '/public/images/favicon.ico'));
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true}));
    app.use(cookieParser());

    /* public folders */
    app.use(express.static(path.join(__dirname, 'public')));
    app.use("/uploads", express.static(path.join(__dirname, 'uploads')));

}

function configureSessionStore() {
    var sessionStore = require('./libs/sessionStore');
    app.use(session({
        secret: config.get('session:secret'),
        key: config.get('session:key'),
        cookie: config.get('session:cookie'),
        store: sessionStore
    }));
}

function addRoutes() {
    var routes = require('./routes/index');
    app.get('/', routes.main);
    app.get('/login', routes.loginGetQuery);
    app.post('/login', routes.loginPostQuery);
    app.get('/users', routes.list);
    app.post('/logout', routes.logout);
    app.get('/user/:name', routes.userInfo);

    app.post('/user/:name', multer({
        dest: './uploads/',
        limits: {
            fileSize: 1000000,
            files: 1
        },

        rename: function (fieldname, filename, req) {
            return 'avatar_' + req.params.name;
        },

        changeDest: function(dest, req, res) {
            var stat = null;

            dest += 'avatars/' + req.params.name;

            try {
                stat = fs.statSync(dest);
            } catch(err) {
                mkdirp(dest, function (err) {
                    if (err) console.error(err);
                    else console.log('pow!')
                });
            }

            if (stat && !stat.isDirectory()) {
                throw new Error('Directory cannot be created because an inode of a different type exists at "' + dest + '"');
            }
            return dest;
        },

        /*onFileUploadStart: function(file, req, res) {

            var filePath = './uploads/avatars/' + req.params.name;

            fs.readdir(filePath, function (err, files) {

                if (!files.length) return;

                files.forEach(function(filename) {
                    fs.unlink(filePath + '/' + filename, function (err, next) {
                        if (err) console.log(err);
                    });
                });
            });
        },*/

        onFileUploadComplete: function (file, req, res) {
            routes.uploadAvatar(file, req, res);
        }
        
    }), function (req, res) {

    });
}

viewEngineSetup();
configureSessionStore();
addRoutes();

// catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

// error handlers

// development error handler
// will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        });
    }
// production error handler
// no stacktraces leaked to user
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            title: '',
            error: {},
            user: req.session.username,
            status: err.status,
            message: ''
        });
    });

// local data-base "uri": "mongodb://localhost/tic-tac-toe”
// heroku data-base "uri": "mongodb://heroku_app33524989:120rd55plc76sug4b9vjhcjfsr@ds051970.mongolab.com:51970/heroku_app33524989",

    module.exports = app;
