require('reset-css');

require('./main.css');
require('./split.css');

var split = require('split.js');
var compositionRoot = require('./../components/composition-root');
var params = require('./params/params');

$(document).ready(function() {
    split(['#diagram', '#params'], {
        sizes: [70, 30],
        minSize: 200
    });
    params.init();
    compositionRoot.run($('#diagram')[0]);
});

