var d3 = require('d3');
require('./diagram-view.css');
var vFactory = require('./../components').ViewFactory;

module.exports = function(vm, parentNode) {

    var svg = d3.select(parentNode)
        .append('svg')
        .attr('class', 'diagram-svg')
        .attr('tabindex', 1)
    ;

    svg.node().focus();

    svg.on('mousedown', function () {
        vm.commandDeselectAll();
        svg.node().focus();
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
            var x = mouse[0];
            var y = mouse[1];
            vm.commandAdd(x, y, 'simpleblock');
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
        if (d3.event.altKey) {
            if (d3.event.keyCode === 38) { //up
                vm.commandResizeSelected(0, -1 * multiplier);
            }
            if (d3.event.keyCode === 40) { // down
                vm.commandResizeSelected(0, 1 * multiplier);
            }
            if (d3.event.keyCode === 37) { // left
                vm.commandResizeSelected(-1 * multiplier, 0);
            }
            if (d3.event.keyCode === 39) { // right
                vm.commandResizeSelected(1 * multiplier, 0);
            }
        } else {
            if (d3.event.keyCode === 38) { //up
                vm.commandMoveSelected(0, -1 * multiplier);
            }
            if (d3.event.keyCode === 40) { // down
                vm.commandMoveSelected(0, 1 * multiplier);
            }
            if (d3.event.keyCode === 37) { // left
                vm.commandMoveSelected(-1 * multiplier, 0);
            }
            if (d3.event.keyCode === 39) { // right
                vm.commandMoveSelected(1 * multiplier, 0);
            }
        }
    });

    function update(data) {
        var elements = svg.selectAll('g').data(data, function (d) {
            return d.id();
        });

        elements.exit().remove();

        elements.enter().append("g").each(function(vm) {
            vFactory(vm, this); // create new self-painting view
        });

        d3.select(parentNode)
            .selectAll('.element')
            .on('mousedown', function(d) {
                if (!vm.dragging()) {
                    if (d3.event.shiftKey){
                        d.commandSelect();
                    } else {
                        if (!d.selected()) {
                            vm.commandDeselectAll();
                            d.commandSelect();
                        }
                    }
                }

                if (d3.event) {
                    d3.event.preventDefault();
                    d3.event.stopPropagation();
                }
            })
        ;
    };


    vm.elements.subscribe(function (newValue) {
        update(newValue);
    });
}