require('reset-css');

require('./main.css');
require('./menu/menu.css');
var menu = require('./menu/menu.js');
require('./split.css');

var split = require('split.js');

var ko = require('knockout');
require('./../components/knockout-init');

var compositionRoot = require('./../components/composition-root');
require('./params/params');
require('.././components/diagram/diagram.css'); // fix cage init: css loads immediate. without this, css loads after code execution

window.onbeforeunload = function() {
    return "Are you sure you want to navigate away?";
}

$(document).ready(function() {
    var splitter = split(['#diagram', '#params'], {
        sizes: [70, 30],
        minSize: 200
    });

    compositionRoot.init();

    var diagramViewModel = compositionRoot.run($('#diagram')[0]);

    //diagramViewModel.elements()[0].commandSelect();

    ko.applyBindings(diagramViewModel, $('#params')[0]);
    ko.applyBindings(diagramViewModel, $('nav')[0]);

    diagramViewModel.showParamsPanel.subscribe(function(newValue) {
        if (newValue) {
            splitter.setSizes([70, 30]);
        } else {
            splitter.collapse(1);
        }
    });

    diagramViewModel.touchMode.subscribe(function(newValue) {
        menu.initTouch(newValue);
    });
    var isTouch = menu.isTouchDevice();
    diagramViewModel.touchMode(isTouch);
});

