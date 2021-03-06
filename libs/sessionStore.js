var mongoose = require('../libs/mongoose');
var expressSession = require('express-session');
var MongoStore = require('connect-mongo')(expressSession);
var sessionStore = new MongoStore({mongooseConnection: mongoose.connection});

module.exports = sessionStore;
