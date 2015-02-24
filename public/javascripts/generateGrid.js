(function(){
    var socket = io(),
        chosenWeapon,
        gameInProgress = false;

    function generateGrid(gridSize) {
        var arr = Array.apply(null, {length: gridSize}).map(Number.call, Number);
        $('.wrapper').prepend($('<div class="grid-container"></div>'));
        arr.forEach(function (n, i) {
            $('.grid-container').append($('<div class="row r' + n + '"></div>'));
            arr.forEach(function (_n) {
                $('.row.r' + n).append($('<div class="cell c' + _n + ' r' + n + '" data-row="' + n + '" data-cell="' + _n + '"><div class="elem"></div>'));
            });
        });

        $(".grid-container").append("<div class='pleaseLogin'><div class='close'>close</div><div class='text'>Please <a href='/login'>log in</a> to be able to play!</div></div>");

        return gridSize;
    }

    $(document).ready(function () {
        generateGrid(3);
        var username = $('.username').text();

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
            $('div.weaponChosen').html("You've chosen <span class='bold'>" + weaponType + "</span>! Waiting for opponent!" ).removeClass('hidden');

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

        console.log(data.weapon);

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
        $('div.battleStarted').html("Battle is in progress! <span class='bold'>" + data["crossPlayer"] + "</span> VS. <span class='bold'>" + data["circlePlayer"] + '</span>!').removeClass('hidden');
    });

    socket.on('restoreGameStatus', function (data) {

        gameInProgress = true;

        $('div.chooseWeapon, div.weaponChosen').addClass('hidden');
        $('div.battleStarted').html("Battle is in progress! <span class='bold'>" + data["crossPlayer"] + "</span> VS. <span class='bold'>" + data["circlePlayer"] + '</span>!').removeClass('hidden');
        $('table td').each(function(index, value) {
            if ($(value).text() === data['crossPlayer']) {
                $(value).removeClass().addClass('cross');
            }
            if ($(value).text() === data['circlePlayer']) {
                $(value).removeClass().addClass('circle');
            }
        });
    });

    socket.on('youArePlayer!', function (weaponId) {
        console.log(weaponId);
        $('#' + weaponId).change();
    })
}());