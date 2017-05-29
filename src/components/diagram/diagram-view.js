var d3 = require('d3');
require('./diagram-view.css');
var vFactory = require('./../components').ViewFactory;

module.exports = function(vm, parentNode) {

    var svg = d3.select(parentNode)
        .append('svg')
        .classed('diagram-svg', true);

    //svg.node().focus();

    svg.on('mousedown', function () {
        vm.commandDeselectAll();
    });

    svg.on('mousemove', function () {
        if (d3.event.buttons == 1) {
            var mouse = d3.mouse(svg.node());
            var oldMouse = vm.dragging() || mouse;

            vm.commandMoveSelected(mouse[0] - oldMouse[0], mouse[1] - oldMouse[1]);
            vm.dragging(mouse);
        } else {
            vm.dragging(null);
        }
    });

    svg.on('mouseup', function () {  //!! implement according to UI state
        if (d3.event.altKey) {
            var mouse = d3.mouse(svg.node());
            vm.commandAdd(mouse[0], mouse[1], 'simpleblock');
        }
    });

    svg.on('keydown', function () {
        if (d3.event.keyCode === 8) {
            vm.commandDeleteSelected();
        }
        var multiplier = 10;
        if (d3.event.shiftKey) {
            multiplier = 1;
        }
        if (d3.event.keyCode === 38) {
            vm.commandMoveSelected(0, -1 * multiplier);
        }
        if (d3.event.keyCode === 40) {
            vm.commandMoveSelected(0, 1 * multiplier);
        }
        if (d3.event.keyCode === 37) {
            vm.commandMoveSelected(-1 * multiplier, 0);
        }
        if (d3.event.keyCode === 39) {
            vm.commandMoveSelected(1 * multiplier, 0);
        }
    });

    function update(data) {
        var elements = svg.selectAll('g').data(data, function (d) {
            return d.id();
        });

        elements.exit().remove();

        circle.enter().append("g").each(function(vm) {
            vFactory(vm, this); // create new self-painting view
        });

        // if (d3.event) {
        //     d3.event.preventDefault();
        //     d3.event.stopPropagation();
        // }
    };


    vm.elements.subscribe(function (newValue) {
        update(newValue);
    });
}