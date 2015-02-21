function makeActive(selector) {
    jQuery(selector).addClass('active');
}

$(document).ready(function () {
    var pageType = jQuery('body').attr('page-type');
    makeActive('li.' + pageType);
});