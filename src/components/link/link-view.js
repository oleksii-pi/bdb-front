var d3 = require('d3');
require('./link.css');

module.exports = function(vm, parentNode) {
    var g = d3.select(parentNode);
    g.attr("class", "link");

    var svg = $(parentNode).closest('svg')[0];

    var lineCurveNatural = d3.line().curve(d3.curveNatural);
    var lineCurveLinear = d3.line().curve(d3.curveLinear);

    if ($(svg).find('defs > marker#end-arrow').length == 0) {
        d3.select(svg).append('svg:defs').append('svg:marker')
            .attr('id', 'end-arrow')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 15)
            .attr('markerWidth', 3)
            .attr('markerHeight', 3)
            .attr('orient', 'auto')
            .append('svg:path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', '#000');
    }

    var getPathPointNearestIndex = function (path, point) {
        const NEAR_DISTANCE = 5;
        var x = point[0];
        var y = point[1];
        var pathLength = path.getTotalLength();
        for (var i = 0; i < pathLength; i++) {
            var p = path.getPointAtLength(i);
            var distance = Math.sqrt(Math.pow(x - p.x, 2) + Math.pow(y - p.y, 2));
            if (distance < NEAR_DISTANCE) {
                return path.getPathSegAtLength(i);
            }
        };
        return 0;
    };

    function translateCoords(x, y) {
        var svgG = d3.select(svg).select('g').node();
        var pt = svg.createSVGPoint();
        pt.x = x;
        pt.y = y;
        pt = pt.matrixTransform(svgG.getCTM().inverse());
        return [pt.x, pt.y];
    };

    if (!vm.destination()) {
        d3.select(svg)
            .on('mousemove.link', function() {
                var m = translateCoords(d3.event.x, d3.event.y);
                vm.commandSetLastPoint(m);
            })
            .on('keydown.link', function() {
               if (d3.event.keyCode == 27) {
                   vm.commandCancelLink();
               }
            })
            .on('click.link', function() {
                var m = translateCoords(d3.event.x, d3.event.y);
                vm.commandAddPoint(m);
            })
        ;
    }

    var svgPath = g.append("path")
        .attr("class", "line")
        .attr('marker-end', function(d,i){ return 'url(#end-arrow)' })
        .on('mousedown', function() {
            this.mousedownSelected = vm.selected();
        })
        .on('click', function() {
            // add
            if (vm.selected() && this.mousedownSelected) {
                var m = translateCoords(d3.event.x, d3.event.y);
                var insertIndex = getPathPointNearestIndex(this, m);
                vm.path.splice(insertIndex - 1, 0, m);
            }
        })
    ;

    function update() {
        var line = vm.diagramStraightLinks() ? lineCurveLinear : lineCurveNatural;

        svgPath
            .datum(vm.fullPath())
            .attr("d", line)
            .attr('pointer-events', vm.destination() ? 'auto' : 'none')
            .classed('selected', () => vm.selected())
        ;

        if (vm.selected()) {
            var path = vm.fullPath();
            var circle = g.selectAll("circle")
                .data(path.slice(1, path.length - 1), function(d) { return d; });

            circle.exit().remove();

            var added = circle.enter()
                .append("circle")
                .attr("r", 5)
                .on('click', function(d) {  // mousedown throw strange error inside d3
                    // remove
                    var index = vm.path().indexOf(d);
                    if (index >= 0) {
                        vm.path.splice(index, 1);
                    }
                })
                ;

            circle.merge(added)
                .attr("cx", function(d) { return d[0]; })
                .attr("cy", function(d) { return d[1]; })
                .call( d3.drag().on("drag", function(d, index) {
                    var m = [d3.event.x, d3.event.y];
                    vm.path()[index] = m;
                    vm.path.valueHasMutated();
                }))
            ;
        } else {
            g.selectAll("circle").remove();
        }

    };

    update();

    vm.hash.subscribe(function (newValue) {
        update();
    });

    vm.destination.subscribe(function(newValue) {
        if (newValue) {
            d3.select(svg)
                .on('mousemove.link', null)
                .on('keydown.link', null)
                .on('click.link', null)
            ;
        }
    });
};