(function ($) {
    var socket = io(),
        chosenWeapon,
        gameInProgress = false,
        username,
        isPlayer = false,
        isYourTurnToHit,
        gameStat = {},
        $doc = $(document),
        chatUl;

    function showBattleInfo(playersObj) {
        $('div.battleStarted')
            .html("Battle is in progress! <span class='bold'>" + playersObj.crossPlayer + "</span> VS. <span class='bold'>" + playersObj.circlePlayer + '</span>!')
            .removeClass('hidden');
    }

    function showWaitOpponentMessage(player, weapon) {
        $(".weaponChosen")
            .html("Player " + "<span class='bold'>" + player + "</span> has chosen <span class='bold'>" + weapon + '</span> and waits for your move!')
            .removeClass('hidden');
    }

    function showWhoseTurnToHit(user) {
        if (user && user !== username) {
            user += "'s";
            isYourTurnToHit = false;
        } else {
            user = 'your';
            isYourTurnToHit = true;
        }

        $('.whoseTurn').html("It's <span class='bold'>" + user + "</span> turn to hit!")
            .removeClass('hidden');
    }

    function preload(arrayOfImages) {
        $(arrayOfImages).each(function () {
            $('<img/>')[0].src = this;
        });
    }

    function checkClassesEquality(elem) {

        // get classes of chosen elements
        var classes = $(elem).map(function (index, value) {
            return $.trim($(value).attr('class').replace('elem', ''));
        });

        // check if all classes are equal
        for (var i = 0; i < classes.length; i++) {

            if (classes[i] !== classes[0]) {
                return false;
            }

            if (!classes[0]) {
                return false
            }
        }

        return true;
    }

    function createAlert(message) {
        return '<div class="alert alert-danger" role="alert"><strong>Oh snap!</strong> ' + message + '</div>';
    }

    function appendAlert(el) {
        $('.btn.restartGame').after(el).fadeIn(300);

        setTimeout(function () {
            $('.alert').fadeOut(300, function(){ $(this).remove();});
        }, 5000);
    }

    function isBattleFinished(lastPlayer, counterUpdated) {

        var setOfElements = {
                "horizontal": [$('.r0 .elem'), $('.r1 .elem'), $('.r2 .elem')],
                'vertical': [$('.c0 .elem'), $('.c1 .elem'), $('.c2 .elem')],
                'diagonalLeft': [$('.r0 .c0 .elem, .r1 .c1 .elem, .r2 .c2 .elem')],
                'diagonalRight': [$('.r0 .c2 .elem, .r1 .c1 .elem, .r2 .c0 .elem')]
            },
            body = $('body'),
            $cells = $('.cell'),
            finished = false;

        for (var key in setOfElements) {

            $(setOfElements[key]).each(function (index, value) {
                var passed = checkClassesEquality(value),
                    gameFinishedPopup = $('.gameFinished');

                if (passed) {
                    var playerStatus = '',
                        finalMessage = 'Game Over! Winner is: ' + lastPlayer;

                    $(value).parent().addClass('crossed ' + key);

                    finished = true;

                    if (isPlayer && lastPlayer === username) {
                        playerStatus = 'winner';
                        finalMessage = 'Congrats! You win!';

                        var loser = gameStat['crossPlayer'] === username ? gameStat['circlePlayer'] : gameStat['crossPlayer'];

                        if (!counterUpdated) {
                            socket.emit('battleFinished', {'winner': username, 'loser': loser})
                        }

                    } else if (isPlayer) {
                        playerStatus = 'loser';
                        finalMessage = "Sorry, you've lost..."
                    }

                    gameFinishedPopup.addClass(playerStatus).text(finalMessage);

                    $('div.battleStarted')
                        .html("Battle is over!")
                        .removeClass('hidden');

                    body.addClass('finished');

                }
            });
        }

        if (!finished && $('.elem.cross, .elem.circle').length === $cells.length) {

            finished = true;
            socket.emit('draw');
            socket.emit('battleFinished', {});
            $('.gameFinished').addClass('draw').text('Draw :|');

        }

        return finished;
    }

    function sendMessage(input) {

        var message = input.val();

        if (message) {
            socket.emit('sendMessage', {user: username, message: message});
        }
        input.val('');
    }

    function appendMessageToChat(mesObj) {
        var message = mesObj.message,
            sender = mesObj.user,
            messageLi,
            noMessagesLi = $('.noMessages');

        if (noMessagesLi.length) {
            noMessagesLi.remove()
        }

        if (sender === username) {
            messageLi = "<li class='message clearfix'><span class='you mesText'>" + message + "<span class='corner left'></span></span></li>";

        } else {
            messageLi = "<li class='message clearfix'><span class='sender'>" + sender + "</span><span class='mesText'>" + message + "<span class='corner right'></span></span></li>"
        }

        chatUl.append(messageLi);
    }

    $doc.ready(function () {

        chatUl = $('.chat ul');

        var images = [
            "/images/yunouo.png",
            '/images/successKid.png',
            "/images/iKnowThatFeelBro.png",
            '/images/AUFKM.png'
        ];

        preload(images);

        username = $('a.username span').text();

        if (username) {
            socket.emit('saveUsername', username);
        }

        if (isForbidden()) {
            $('.chooseWeapon input').attr('disabled', true);
            $('.chooseWeapon label').addClass("chosen");
            $('.restartGame').addClass('disabled');
        } else {

            // handlers for chat

            $('#btn-input').keyup(function (e) {
                if (e.which === 13) {
                    sendMessage($(this));
                }
            });

            $('#btn-chat').click(function () {
                var textInput = $('#btn-input');
                sendMessage(textInput);
            });
        }

    });

    $doc.on('click', '.cell:not(.filled), .close', function () {

        if (isForbidden()) {
            $('body').toggleClass('forbidden');
            return false
        }

        if (gameInProgress && !isYourTurnToHit) {
            return false
        }

        var data = {
            'data-row': $(this).attr('data-row'),
            'data-cell': $(this).attr('data-cell'),
            'weapon': chosenWeapon,
            'player': username
        };

        if (data['weapon']) {
            socket.emit('fillCell', data);
        }

        return false

    });

    $doc.on('change', '.weaponType', function () {

        var weaponType = $(this).attr('value');
        chosenWeapon = weaponType;
        socket.emit('chooseWeapon', weaponType);

        if (!gameInProgress) {
            $('div.chooseWeapon').addClass('hidden');
            $('div.weaponChosen')
                .html("You've chosen <span class='bold'>" + weaponType + "</span>! Waiting for opponent!")
                .removeClass('hidden');

            $('table td').each(function (index, value) {
                if ($(value).text() === $('a.username span').text()) {
                    $(value).removeClass().addClass(weaponType);
                }
            })
        }

    });

    $doc.on('click', '.restartGame', function () {

        $('.restartGame').addClass('disabled');

        console.log(username, gameStat);

        if ( !isForbidden() && (username === gameStat['circlePlayer'] || username === gameStat['crossPlayer']) ) {
            socket.emit('restartGame');
        } else {
            var alert = createAlert("You've got no power here!");
            appendAlert(alert);
        }
    });

    socket.on('fillCell', function (data) {
        var formData = data,
            chosenCell = $('.cell.r' + formData['data-row'] + '.c' + formData['data-cell']),
            elemToFill = chosenCell.find('.elem');
        chosenCell.addClass('filled');
        elemToFill.addClass(formData['weapon']);

        if (gameInProgress) {
            isBattleFinished(formData['player']);
        }
    });

    socket.on('chooseWeapon', function (data) {

        $('input[id=' + data.weapon + ']').attr('disabled', true);
        $('label[for=' + data.weapon + ']').addClass('chosen');

        $('table td').each(function (index, value) {

            if ($(value).text() === data.user) {
                $(value).removeClass().addClass(data.weapon);
            }
        })
    });

    socket.on('restartGame', function () {
        location.reload();
    });

    socket.on("whoIsOnline", function (data) {
        var whoIsOnlineTable = $(".whoOnline table");
        whoIsOnlineTable.html("");
        if (data.length) {
            $(data).each(function (index, value) {

                value = $.trim(value);

                whoIsOnlineTable.append("<tr><td><a href='/user/" + value + "'>" + value + "</a></tr></td>");
            })
        } else {
            whoIsOnlineTable.html("<tr><td>Oops! No one is online... yet.</tr></td>");
        }
    });

    socket.on('startGame', function (data) {

        gameStat = data;

        gameInProgress = true;

        if (username === data.circlePlayer || username === data.crossPlayer) {
            isPlayer = true;
        }

        $('div.chooseWeapon, div.weaponChosen').addClass('hidden');
        showBattleInfo(data);

        $('.cell').removeClass('filled');

        $('.grid-container .elem').removeClass('cross circle');

        socket.emit('clearBoard');

    });

    socket.on('restoreGameStatus', function (gameStatusObj) {

        gameStat = gameStatusObj;

        if (gameStatusObj["gameStarted"]) {

            // game in progress

            gameInProgress = true;

            $('div.chooseWeapon, div.weaponChosen').addClass('hidden');

            if (username === gameStatusObj.circlePlayer || username === gameStatusObj.crossPlayer) {
                isPlayer = true;
            }

            showBattleInfo(gameStatusObj);

            var player = gameStatusObj["turnToHit"];

            if (player && player !== username) {
                player += "'s";
                isYourTurnToHit = false;
            } else {
                player = 'your';
                isYourTurnToHit = true;
            }

            showWhoseTurnToHit(gameStatusObj['turnToHit']);

        } else if (gameStatusObj["waitingForOpponent"]) {

            // waiting for opponent

            var weaponToDisable = gameStatusObj["crossPlayer"] ? 'cross' : 'circle',
                playersName = gameStatusObj[weaponToDisable + "Player"];

            if (username !== playersName) {
                showWaitOpponentMessage(playersName, weaponToDisable);
            } else {
                $(".weaponChosen")
                    .html("You've chosen " + "<span class='bold'>" + weaponToDisable + "</span> Waiting for opponent!")
                    .removeClass('hidden');
                $('.chooseWeapon').addClass('hidden');
                $('#' + weaponToDisable).change();
            }

            $('input[id=' + weaponToDisable + ']').attr('disabled', true);
            $('label[for=' + weaponToDisable + ']').addClass('chosen');

        }

        // add cross and circle icons in "Who is online?" table

        $('table td').each(function (index, value) {

            function findPlayer(player, weapon) {
                if ($(player).text() === gameStatusObj[weapon + 'Player']) {
                    $(player).removeClass().addClass(weapon);
                }
            }

            findPlayer(value, 'cross');
            findPlayer(value, 'circle');

        });

        // fill marked fields
        var filledCellsArr = gameStatusObj['filledCells'];

        $(filledCellsArr).each(function (index, value) {
            var matchedCell = $('.cell' + '.r' + value["data-row"] + '.c' + value["data-cell"] + ' .elem');
            matchedCell.addClass(value['weapon']);
        });

        if (gameInProgress) {
            isBattleFinished(gameStatusObj["lastHitPlayer"], gameStatusObj['gameFinished']);
        }

    });

    socket.on('youArePlayer!', function (weaponId) {
        $('#' + weaponId).change();
    });

    socket.on('waitingForOpponent', function (data) {
        showWaitOpponentMessage(data.name, data.weapon);
    });

    socket.on('whoseTurn?', function (player) {
        showWhoseTurnToHit(player);
    });

    socket.on('sendMessage', function (messageObj) {
        appendMessageToChat(messageObj)
    });

    socket.on('restoreChat', function (data) {
        if (data.chatMessages.length) {
            $(data.chatMessages).each(function (index, value) {
                appendMessageToChat(value);
            });
        } else {
            chatUl.append('<li class="noMessages">Oops! No messages here... yet.</li>');
        }
    });
    
    socket.on('draw', function () {

        $('.gameFinished').addClass('draw').text('Draw :|');

        $('div.battleStarted')
            .html("Battle is over!")
            .removeClass('hidden');

        $('body').addClass('finished');
    })

}(jQuery));