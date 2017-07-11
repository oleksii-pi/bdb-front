// https://jsfiddle.net/tolexis/m50wvdgz/1/

module.exports.isTouchDevice = function () {
    return 'ontouchstart' in window        // works on most browsers
        || navigator.maxTouchPoints;       // works on IE10/11 and Surface
};

module.exports.initTouch = function (touch) {

    var initTouchMode = function () {
        $('nav li').unbind();
        $('nav span:not(.uncloseMenu)').unbind();
        $('nav ul').css('display', "");
    };

    var initDesktopMode = function() {
        $('nav li').hover(
            function(event) {
                $(this).find('ul').first().css('display', 'block');
            },
            function(event) {
                $(this).find('ul').first().css('display', 'none');
        });

        $('nav span:not(.uncloseMenu)').click(function(event) {
            $('nav ul li > ul').hide();
        });

        $('nav li').on('touchstart', function(event) {
            $('nav ul li > ul')
                .not($(this).parents('ul'))
                .hide();
            $(this).find('ul').first().toggle();
        });
    };

    if (touch) {
        initTouchMode();
    } else {
        initDesktopMode();
    }
};