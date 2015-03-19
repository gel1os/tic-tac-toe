(function ($) {

    function generateGrid(gridSize) {

        var arr = Array.apply(null, {length: gridSize}).map(Number.call, Number);

        $('.restartGame').before($('<div class="grid-container"></div>'));
        arr.forEach(function (n) {
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

}(jQuery));