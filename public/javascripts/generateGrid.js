(function(){
    var socket = io(),
        chosenWeapon,
        gameInProgress = false,
        username,
        isYourTurnToHit;

    function generateGrid(gridSize) {

        var arr = Array.apply(null, {length: gridSize}).map(Number.call, Number);
        $('.wrapper').prepend($('<div class="grid-container"></div>'));
        arr.forEach(function (n, i) {
            $('.grid-container').append($('<div class="row r' + n + '"></div>'));
            arr.forEach(function (_n) {
                $('.row.r' + n).append($('<div class="cell c' + _n + ' r' + n + '" data-row="' + n + '" data-cell="' + _n + '"><div class="elem"></div>'));
            });
        });

        var pleaseLoginPopup =
                "<div class='pleaseLogin'>" +
                    "<div class='close'>close</div>" +
                    "<div class='text'>Please <a href='/login'>log in</a> to be able to play!</div>" +
                "</div>";

        $(".grid-container").append(pleaseLoginPopup);

        return gridSize;
    }

    function showBattleInfo(playersObj) {
        $('div.battleStarted')
            .html("Battle is in progress! <span class='bold'>" + playersObj["crossPlayer"] + "</span> VS. <span class='bold'>" + playersObj["circlePlayer"] + '</span>!')
            .removeClass('hidden');
    }

    function showWaitOpponentMessage(player, weapon) {
        $(".weaponChosen")
            .html("Player " + "<span class='bold'>" + player + "</span> has chosen <span class='bold'>" + weapon + '</span> and waits for your move!' )
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

    $(document).ready(function () {
        generateGrid(3);

        username = $('.username').text();

        if (username) {
            socket.emit('saveUsername', username);
        }

        if (isForbidden()) {
            $('.chooseWeapon input').attr('disabled', true);
            $('.chooseWeapon label').addClass("chosen");
            $('.restartGame').addClass('disabled');
        }

    });

    $(document).on('click', '.cell:not(.filled), .close', function () {

        if (isForbidden()) {
            $('.grid-container').toggleClass('forbidden');
            return false
        }

        if ( gameInProgress && !isYourTurnToHit) {
            return false
        }

        var data = {
            'data-row': $(this).attr('data-row'),
            'data-cell': $(this).attr('data-cell'),
            'weapon': chosenWeapon
        };

        if (data['weapon']) {
            socket.emit('fillCell', data);
        }

        return false

    });

    $(document).on('change', '.weaponType', function () {

        var weaponType = $(this).attr('value');
        chosenWeapon = weaponType;
        socket.emit('chooseWeapon', weaponType);

        if (!gameInProgress) {
            $('div.chooseWeapon').addClass('hidden');
            $('div.weaponChosen')
                .html("You've chosen <span class='bold'>" + weaponType + "</span>! Waiting for opponent!" )
                .removeClass('hidden');

            $('table td').each(function(index, value) {
                if ($(value).text() === $('div.username').text()) {
                    $(value).removeClass().addClass(weaponType);
                }
            })
        }

    });

    $(document).on('click', '.restartGame', function () {

        $('.restartGame').addClass('disabled');

        if (!isForbidden()) {
            socket.emit('restartGame');
        }
    });

    socket.on('fillCell', function (data) {
        var formData = data,
            chosenCell = $('.cell.r' + formData['data-row'] + '.c' + formData['data-cell']),
            elemToFill = chosenCell.find('.elem');
        chosenCell.addClass('filled');
        elemToFill.addClass(formData['weapon']);
    });

    socket.on('chooseWeapon', function (data) {

        $('input[id=' + data.weapon + ']').attr('disabled', true);
        $('label[for=' + data.weapon + ']').addClass('chosen');

        jQuery('table td').each(function(index, value) {
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
                whoIsOnlineTable.append("<tr><td>" + value + "</tr></td>");
            })
        } else {
            whoIsOnlineTable.html("<tr><td>Oops! No one is online... yet.</tr></td>");
        }
    });

    socket.on('startGame', function (data) {

        gameInProgress = true;
        $('div.chooseWeapon, div.weaponChosen').addClass('hidden');
        showBattleInfo(data);

    });

    socket.on('restoreGameStatus', function (gameStatusObj) {

        if (gameStatusObj["gameStarted"]) {

            // game in progress

            gameInProgress = true;

            $('div.chooseWeapon, div.weaponChosen').addClass('hidden');

            showBattleInfo(gameStatusObj);

            var player = gameStatusObj["turnToHit"];

            if ( player && player !== username) {
                player += "'s";
                isYourTurnToHit = false;
            } else {
                player = 'your';
                isYourTurnToHit = true;
            }

            $('.whoseTurn').html("It's <span class='bold'>" + player + "</span> turn to hit!")
                .removeClass('hidden');

        } else if ( gameStatusObj["waitingForOpponent"] ) {

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

        $('table td').each(function(index, value) {

            function findPlayer(player, weapon) {
                if ($(player).text() === gameStatusObj[weapon + 'Player']) {
                    $(player).removeClass().addClass(weapon);
                }
            }

            findPlayer(value, 'cross');
            findPlayer(value, 'circle');

        });

        showWhoseTurnToHit(gameStatusObj['turnToHit']);

        var filledCellsArr = gameStatusObj['filledCells'];

        $(filledCellsArr).each(function (index, value) {
            var matchedCell = $('.cell' + '.r' + value["data-row"] + '.c' + value["data-cell"] + ' .elem');
            matchedCell.addClass(value['weapon']);
        })

    });

    socket.on('youArePlayer!', function (weaponId) {
        $('#' + weaponId).change();
    });

    socket.on('waitingForOpponent', function(data) {
        showWaitOpponentMessage(data.name, data.weapon);
    });

    socket.on('whoseTurn?', function(player) {

        showWhoseTurnToHit(player);

    })

}());