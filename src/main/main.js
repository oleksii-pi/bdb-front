require('reset-css');

require('./main.css');
require('./menu/menu.css');
require('./menu/menu.js');
require('./split.css');

var split = require('split.js');
var compositionRoot = require('./../components/composition-root');
require('./params/params');

window.onbeforeunload = function() {
    return "Are you sure you want to navigate away?";
}

$(document).ready(function() {
    split(['#diagram', '#params'], {
        sizes: [70, 30],
        minSize: 200
    });
    compositionRoot.run($('#diagram')[0]);
});

