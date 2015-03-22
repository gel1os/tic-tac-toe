var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('./config');
var mongoose = require('mongoose');
var session = require('cookie-session');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* session store [start] */
var sessionStore = require('./libs/sessionStore');
app.use(session({
    secret: config.get('session:secret'),
    key: config.get('session:key'),
    cookie: config.get('session:cookie'),
    store: sessionStore
}));
/* session store [end] */

/* routes [start] */

var mainPage = require('./routes/index').main;
var users = require('./routes/users');
var login = require('./routes/login');
var logout = require('./routes/logout').logout;

app.get('/', mainPage);
app.get('/login', login.loginGetQuery);
app.post('/login', login.loginPostQuery);
app.get('/users', users.list);
app.post('/logout', logout);

/* routes [end] */

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
