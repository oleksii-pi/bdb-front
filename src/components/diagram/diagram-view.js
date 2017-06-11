var d3 = require('d3');
require('./diagram.css');
var vFactory = require('./../components').ViewFactory;

module.exports = function(vm, parentNode) {

    var svg = d3.select(parentNode)
        .append('svg')
        .attr('class', 'diagram-svg')
        .attr('tabindex', 1)
    ;

    var rootGroup = svg.append('g').classed('root', true);
    var cageGroup = rootGroup.append('g').classed('cage', true);
    var linksGroup = rootGroup.append('g').classed('links', true);
    var elementsGroup = rootGroup.append('g').classed('elements', true);

    var focusDiagram = () => svg.node().focus();
    focusDiagram();

    svg.on('mousedown', function () {
        if (!vm.linking()) {
            vm.commandDeselectAll();
        }
        focusDiagram();

        if (d3.event.altKey) {  //!! implement according to UI state
            var mouse = d3.mouse(svg.select('g').node());
            var x = mouse[0];
            var y = mouse[1];
            vm.commandAdd(x, y, 'block');
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





    svg.call(d3.zoom()
        .scaleExtent([0.3, 8])
        .on("zoom", function() {
            rootGroup.attr("transform", d3.event.transform);
        }));

    function update(data, parentGroup) {
        var elements = parentGroup.selectAll(() => parentGroup.node().childNodes).data(data, function (d) {
            return d.id();
        });
        elements.exit().remove();

        elements.enter()
            .append('g')
            .each(function(elementVM) {
                vFactory(elementVM, this);
            })
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
                };
                focusDiagram();

                if (d3.event) {
                    d3.event.preventDefault();
                    d3.event.stopPropagation();
                }
            })
            .call( d3.drag().on('start', dragStart).on("drag", dragged).on('end', dragEnd) )
        ;

        function dragStart() {
            vm.dragging(true);
        }

        function dragged() {
            vm.commandMoveSelected(d3.event.dx, d3.event.dy);
        };

        function dragEnd() {
            vm.dragging(false);
            // save
        };
    };


    vm.elements.subscribe(function (newValue) {
        update(newValue, elementsGroup);
    });

    vm.links.subscribe(function (newValue) {
        update(newValue, linksGroup);
    });

    vm.linking.subscribe(newValue => {
        elementsGroup.selectAll('.linkIn')
            .attr('visibility', newValue ? 'visible' : 'hidden');
    });

    vm.showCage.subscribe(newValue => {
        if (newValue) {
            var svgBounds = svg.node().getBoundingClientRect();
            var width = ~~svgBounds.width; // ~~ = round
            var height = ~~svgBounds.height; // ~~ = round

            cageGroup.insert("g", 'g')
                .attr("class", "x axis")
                .selectAll("line")
                .data(d3.range(0, width, 10))
                .enter().append("line")
                .attr("x1", function (d) {
                    return d;
                })
                .attr("y1", 0)
                .attr("x2", function (d) {
                    return d;
                })
                .attr("y2", height);

            cageGroup.insert("g", 'g')
                .attr("class", "y axis")
                .selectAll("line")
                .data(d3.range(0, height, 10))
                .enter().append("line")
                .attr("x1", 0)
                .attr("y1", function (d) {
                    return d;
                })
                .attr("x2", width)
                .attr("y2", function (d) {
                    return d;
                });
        } else {
            cageGroup.selectAll('.axis').remove();
        }
    });
}