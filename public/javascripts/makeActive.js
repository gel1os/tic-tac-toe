function makeActive(selector) {
    $(selector).addClass('active');
}

$(document).ready(function () {
    var pageType = $('body').attr('page-type');
    makeActive('li.' + pageType);

    $.ripple(".btn, .nav-list a", {
        debug: false, // Turn Ripple.js logging on/off
        on: 'mousedown', // The event to trigger a ripple effect

        opacity: 0.6, // The opacity of the ripple
        color: "auto", // Set the background color. If set to "auto", it will use the text color
        multi: false, // Allow multiple ripples per element

        duration: 0.7, // The duration of the ripple

        // Filter function for modifying the speed of the ripple
        rate: function(pxPerSecond) {
            return pxPerSecond;
        },

        easing: 'default' // The CSS3 easing function of the ripple
    });
});