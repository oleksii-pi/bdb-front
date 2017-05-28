require('./../css/style.css');
require('./../css/split.css');


var $ = require('jquery');
var split = require('split.js');


$(document).ready(function() {

    split(['#diagram', '#params'], {
        sizes: [70, 30],
        minSize: 200
    });
});