var d3 = require('d3');
require('./link.css');

module.exports = function(vm, parentNode) {
    var g = d3.select(parentNode);
    g.attr("class", "link");

    var svg = $(parentNode).closest('svg')[0];

    var line = d3.line().curve(d3.curveNatural);

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
                   vm.commandCancel();
               }
            })
            .on('click.link', function() {
                var m = translateCoords(d3.event.x, d3.event.y);
                vm.commandAddPoint(m);
            })
        ;
    }

    function update() {
        g.select('path').remove();

        var svgPath = g.append("path")
            .attr("class", "line")
            .attr('marker-end', function(d,i){ return 'url(#end-arrow)' })
            .datum(vm.fullPath())
            .attr("d", line)
            .attr('pointer-events', vm.destination() ? 'auto' : 'none')
            .classed('selected', () => vm.selected())
        ;

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