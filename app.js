var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('./config');
var mongoose = require('mongoose');
var session = require('cookie-session');
var multer  = require('multer');
var app = express();

function viewEngineSetup() {
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');

    app.use(favicon(__dirname + '/public/images/favicon.ico'));
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true}));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));

    app.use(multer({ dest: './uploads/',
        rename: function (fieldname, filename) {
            return filename+Date.now();
        },
        onFileUploadStart: function (file) {
            console.log(file.originalname + ' is starting ...');
        },
        onFileUploadComplete: function (file) {
            console.log(file.fieldname + ' uploaded to  ' + file.path);
        }
    }));
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
    app.post('/user/:name', routes.uploadAvatar);
}

viewEngineSetup();
configureSessionStore();
addRoutes();

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// local data-base "uri": "mongodb://localhost/tic-tac-toe”
// heroku data-base "uri": "mongodb://heroku_app33524989:120rd55plc76sug4b9vjhcjfsr@ds051970.mongolab.com:51970/heroku_app33524989",

module.exports = app;
