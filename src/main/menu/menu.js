// https://jsfiddle.net/tolexis/m50wvdgz/1/

var isTouchDevice = function () {
    return 'ontouchstart' in window        // works on most browsers
        || navigator.maxTouchPoints;       // works on IE10/11 and Surface
};

var touchMode = isTouchDevice();

var initDesktopMode = function() {
    $('li').hover(
        function(event) {
            $(this).find('ul').first().css('display', 'block');
        },
        function(event) {
            $(this).find('ul').first().css('display', 'none');
        });

    $('span:not(.uncloseMenu)').click(function(event) {
        $('nav ul li > ul').hide();
    });
};


if (touchMode) {
    //initTouchMode();
} else {
    initDesktopMode();
}