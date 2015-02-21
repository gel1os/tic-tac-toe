var socket = io(),
    chosenWeapon;

function generateGrid(gridSize) {
    var arr = Array.apply(null, {length: gridSize}).map(Number.call, Number);
    $('.wrapper').prepend($('<div class="grid-container"></div>'));
    arr.forEach(function (n, i) {
        $('.grid-container').append($('<div class="row r' + n + '"></div>'));
        arr.forEach(function (_n) {
            $('.row.r' + n).append($('<div class="cell c' + _n + ' r' + n + '" data-row="' + n + '" data-cell="' + _n + '"><div class="elem"></div>'));
        });
    });
    return gridSize;
}

$(document).ready(function () {
    generateGrid(3);
});

$(document).on('click', '.cell:not(.filled)', function () {
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
});

$(document).on('click', '.restartGame', function () {
    socket.emit('restartGame');
});

socket.on('fillCell', function (data) {
    var formData = data,
        chosenCell = $('.cell.r' + formData['data-row'] + '.c' + formData['data-cell']),
        elemToFill = chosenCell.find('.elem');
    chosenCell.addClass('filled');
    elemToFill.addClass(formData['weapon']);
});

socket.on('chooseWeapon', function (data) {

    $('input').attr('disabled', false);
    $('label').removeClass('chosen');

    $('input[id=' + data + ']').attr('disabled', true);
    $('label[for=' + data + ']').addClass('chosen');
});

socket.on('restartGame', function () {
    location.reload();
});

socket.on('connect', function () {
    socket.emit('isWeaponSelected');
});

socket.on('whoIsOnline', function (data) {
    console.log(data);
    var whoIsOnlineTable = jQuery(".whoOnline table");

    whoIsOnlineTable.html("");

    $(data).each(function(index, value) {
        console.log(value);
        whoIsOnlineTable.append("<tr><td>" + value + "</td></tr>")
    })

});



/*socket.on('isWeaponSelected', function (data) {
 console.log(data);
 if (data) {
 $('input[id=' + data + ']').attr('disabled', true);
 $('label[for=' + data + ']').addClass('chosen');
 }
 });*/



