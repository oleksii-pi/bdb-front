require('reset-css');

require('./main.css');
require('./menu/menu.css');
var menu = require('./menu/menu.js');
require('./split.css');

var split = require('split.js');
var compositionRoot = require('./../components/composition-root');
require('./params/params');

window.onbeforeunload = function() {
    return "Are you sure you want to navigate away?";
}

$(document).ready(function() {
    var splitter = split(['#diagram', '#params'], {
        sizes: [70, 30],
        minSize: 200
    });
    menu.init();
    compositionRoot.run($('#diagram')[0], splitter);
});

