var d3 = require('d3');
require('./diagram.css');
var vFactory = require('./../components').ViewFactory;
require('./touch.css');

module.exports = function(vm, parentNode) {

    var svg = d3.select(parentNode)
        .append('svg')
        .attr('class', 'diagram-svg')
        .attr('tabindex', 1)
    ;

    var rootScalableGroup = svg.append('g').classed('root', true);
    var cageGroup = rootScalableGroup.append('g').classed('cage', true);
    var linksGroup = rootScalableGroup.append('g').classed('links', true);
    var elementsGroup = rootScalableGroup.append('g').classed('elements', true);

    // menu and saving indicator:

    var menusGroup = svg.append('g').classed('menus', true);
    var indicatorGroup = menusGroup.append('g').classed('indicator', true);

    indicatorGroup
        .append('rect')
        .attr('fill', 'white')
        .attr('x', 10)
        .attr('y', 0)
        .attr('width', 60)
        .attr('height', 14)
    ;

    indicatorGroup
        .append('text')
        .attr('fill', 'gray')
        .attr('x', 10)
        .attr('y', 10)
        .text('saving...')
    ;

    vm.saving.subscribe(newValue => {
        indicatorGroup
            .attr('visibility', 'visible')
            .transition()
            .delay(500)
            .duration(100)
            .attr('visibility', 'hidden');
    });

    // end menu and saving indicator:

    var focusDiagram = () => svg.node().focus();
    focusDiagram();

    svg.on('mousedown', function () {
        if (!vm.linking()) {
            vm.commandDeselectAll();
        }
        focusDiagram();

        if (vm.pendingClickNewComponent()) { 
            var mouse = d3.mouse(svg.select('g').node());
            var x = mouse[0];
            var y = mouse[1];
            vm.commandAdd(x, y, vm.pendingClickNewComponent());
            vm.pendingClickNewComponent(null);
        }
    });

    svg.on('keydown', function () {
        // backspace/delete
        if (d3.event.keyCode === 8 || d3.event.keyCode === 46) {
            vm.commandDeleteSelected();
        }

        if (d3.event.ctrlKey || d3.event.metaKey) {
            // ctrl/command + A
            if (d3.event.keyCode === 65) {
                vm.commandSelectAll();
                if (d3.event) {
                    d3.event.preventDefault();
                    d3.event.stopPropagation();
                }
            }

            // ctrl/command + Z
            if (d3.event.keyCode === 90) {
                if (d3.event.shiftKey) {
                    vm.commandRedo();
                } else {
                    vm.commandUndo();
                }
                if (d3.event) {
                    d3.event.preventDefault();
                    d3.event.stopPropagation();
                }
            }
        }

        // ctrl/command + C, V, X
        if (d3.event.ctrlKey || d3.event.metaKey) {
            // copy
            if (d3.event.keyCode == 67) {
                vm.commandCopySelectedToClipboard();

                if (d3.event) {
                    d3.event.preventDefault();
                    d3.event.stopPropagation();
                }
            }

            // cut
            if (d3.event.keyCode == 88) {
                vm.commandCopySelectedToClipboard();
                vm.commandDeleteSelected();

                if (d3.event) {
                    d3.event.preventDefault();
                    d3.event.stopPropagation();
                }
            }

            // paste
            if (d3.event.keyCode == 86) {
                vm.commandPasteFromClipboard();

                if (d3.event) {
                    d3.event.preventDefault();
                    d3.event.stopPropagation();
                }
            }
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


    var zoom = d3.zoom()
        .scaleExtent([0.3, 8])
        .on("zoom", function() {
            rootScalableGroup.attr("transform", d3.event.transform);
        });
    svg.call(zoom);

    vm.scale.subscribe(newValue => {
        zoom.scaleTo(svg, newValue);
    });

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

    vm.pendingClickNewComponent.subscribe(newValue => {
        if (newValue) {
            elementsGroup.style("cursor", "crosshair");
        } else {
            elementsGroup.style("cursor", "pointer");
        }
    });

    vm.touchMode.subscribe(newValue => {
        if (newValue) {
            $('body').addClass('touch');
        } else {
            $('body').removeClass('touch');
        }
    });

    vm.showCage.subscribe(newValue => {
        if (newValue) {
            var svgBounds = svg.node().getBoundingClientRect();

            // ~~ = round:
            var width = ~~svgBounds.width;
            var height = ~~svgBounds.height;

            var left = -width;
            var top = -height;
            width = width * 3;
            height = height * 3;

            cageGroup.insert("g", 'g')
                .attr("class", "x axis")
                .selectAll("line")
                .data(d3.range(left, width, 10))
                .enter().append("line")
                .attr("x1", function (d) {
                    return d;
                })
                .attr("y1", top)
                .attr("x2", function (d) {
                    return d;
                })
                .attr("y2", height);

            cageGroup.insert("g", 'g')
                .attr("class", "y axis")
                .selectAll("line")
                .data(d3.range(top, height, 10))
                .enter().append("line")
                .attr("x1", left)
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