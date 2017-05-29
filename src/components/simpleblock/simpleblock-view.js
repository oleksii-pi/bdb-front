var d3 = require('d3');
require('./simpleblock.css');

module.exports = function(vm, parentNode) {
    var g = d3.select(parentNode);

    g.append('rect')
        .attr("class", "element simpleblock")
    ;

    g.append('text');

    function update() {

        g.select('rect')
            .attr('x', vm.x())
            .attr('y', vm.y())
            .attr('width', vm.width())
            .attr('height', vm.height())
            .classed('selected', d => d.selected())
        ;

        g.select('text')
            .attr('x', d => d.x() + 5)
            .attr('y', d => d.y() + 20)
            .html(d => d.id())
        ;

    };

    update();

    vm.hash.subscribe(function (data) {
        console.log('simpleblock update ' + data);
        update();
    });
};