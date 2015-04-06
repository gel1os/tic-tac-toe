

module.exports = function (client) {
    var gameInfo = require('../middleware/gameInfo');
    var User = require('../models/user').User;
    var mongoose = require('../libs/mongoose');

    //drop data-base
    /*mongoose.connection.collections['users'].drop( function(err) {
        console.log('collection dropped');
    });*/

    function dropGameStatus(obj) {
        for (var key in obj) {

            if (key !== "usersOnline") {
                var typeOfVal = typeof obj[key],
                    emptyVal = typeOfVal !== 'string'
                        ? typeOfVal !== 'object'
                            ? typeOfVal !== 'boolean'
                                ? ''
                                : false
                            : []
                        : '';
                obj[key] = emptyVal;
            }
        }
    }

    client.sockets.on('connection', function(socket) {

        console.log('user arrived');

        socket.emit('restoreChat', gameInfo);

        client.emit('whoIsOnline', gameInfo['usersOnline']);

        if ( gameInfo['gameStarted'] || gameInfo['waitingForOpponent'] ) {

            // game in progress or waiting for opponent
            client.emit('restoreGameStatus', gameInfo);
        }

        socket.on('fillCell', function(data) {

            client.emit('fillCell', data);

            // detect whose turn to hit next

            if (gameInfo['gameStarted']) {

                var lastHitBy = data["weapon"];

                gameInfo['lastHitPlayer'] = data['player'];

                if (lastHitBy === 'cross') {
                    gameInfo['turnToHit'] = gameInfo['circlePlayer'];
                } else {
                    gameInfo['turnToHit'] = gameInfo['crossPlayer'];
                }

                client.emit('whoseTurn?', gameInfo['turnToHit']);

            }

            // save filled cells
            gameInfo["filledCells"].push(data);

        });

        socket.on('chooseWeapon', function (data) {

            if (!socket.username) {
                return
            }

            socket.chosenWeapon = data;

            if (!gameInfo['gameStarted']) {

                // check if this weapon has been chosen

                for(var prop in gameInfo) {
                    if(gameInfo.hasOwnProperty(prop)) {
                        if(gameInfo[prop] === socket.username) {
                            gameInfo[prop] = '';
                        }
                    }
                }

                // assign player to chosen weapon

                gameInfo[socket.chosenWeapon + 'Player'] = socket.username;

                if (gameInfo['crossPlayer'] && gameInfo['circlePlayer']) {

                    // both players are present, "start game" event
                    gameInfo['gameStarted'] = true;
                    gameInfo['waitingForOpponent'] = false;
                    client.emit('startGame', gameInfo);

                    gameInfo['turnToHit'] = gameInfo['crossPlayer'];
                    client.emit('whoseTurn?', gameInfo['turnToHit']);

                } else {

                    // only one player is present, "waiting for opponent" event

                    gameInfo['waitingForOpponent'] = true;

                    var player = {
                        'name': socket.username,
                        'weapon': socket.chosenWeapon
                    };

                    socket.broadcast.emit('waitingForOpponent', player);
                }

            }

            var responseObj = {
                user: socket.username,
                weapon: socket.chosenWeapon
            };

            socket.broadcast.emit('chooseWeapon', responseObj);

        });

        socket.on('restartGame', function () {
            if (socket.username) {
                client.emit('restartGame');
                dropGameStatus(gameInfo);
            }
        });

        socket.on('saveUsername', function (data) {
            if (data) {

                socket.username = data;
                var nameExists = gameInfo['usersOnline'].filter(function (value) {
                    return value === socket.username
                });

                if (!nameExists.length) {

                    gameInfo['usersOnline'].push(socket.username);
                    
                    client.emit('whoIsOnline', gameInfo['usersOnline']);

                    if ( gameInfo['gameStarted'] || gameInfo['waitingForOpponent'] ) {

                        client.emit('restoreGameStatus', gameInfo);

                        var player;

                        if (socket.username === gameInfo['crossPlayer']) {
                            player = 'cross';
                        } else if (socket.username === gameInfo['circlePlayer']) {
                            player = 'circle';
                        }

                        if (player) {
                            client.to(socket.id).emit("youArePlayer!", player);
                        }

                    }
                }
            }
        });

        socket.on('disconnect', function () {
            var socketUsername = socket.username;
            if (socketUsername) {
                gameInfo['usersOnline'].splice(gameInfo['usersOnline'].indexOf(socketUsername), 1);
                socket.username = null;
            }

            client.emit('whoIsOnline', gameInfo['usersOnline']);
            
            if (gameInfo['gameStarted'] || gameInfo['waitingForOpponent'] ) {
                client.emit('restoreGameStatus', gameInfo);
            }
        });

        socket.on('logout', function () {

            if (socket.username) {
                gameInfo['usersOnline'].splice(gameInfo['usersOnline'].indexOf(socket.username), 1);
                socket.username = null;
            }

            client.emit('whoIsOnline', gameInfo['usersOnline']);

            if (gameInfo['gameStarted'] || gameInfo['waitingForOpponent']) {
                socket.emit('restoreGameStatus', gameInfo);
            }
        });

        socket.on('clearBoard', function () {
            gameInfo["filledCells"] = [];
        });

        socket.on('battleFinished', function(data) {
            if (!gameInfo['gameFinished']) {
                
                User.findOne({username: data.winner}, function (err, user) {
                    if (user) {
                        var value = user.winner + 1;

                        User.update({_id: user._id}, {$set: {winner: value}}, function(err){
                        });

                    }
                });

                User.findOne({username: data.loser}, function (err, user) {
                    if (user) {
                        var value = user.loser + 1;

                        User.update({_id: user._id}, {$set: {loser: value}}, function(err){
                        });
                    }
                });

                gameInfo['gameFinished'] = true;
            }
        });

        socket.on('sendMessage', function (data) {
            client.emit('sendMessage', data);
            gameInfo.chatMessages.push(data);
        })
    });
};

