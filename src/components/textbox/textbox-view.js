var d3 = require('d3');
require('./textbox.css');

const margin = 4;

module.exports = function(vm, parentNode) {
    var g = d3.select(parentNode);
    g.attr("class", "element textbox");

    g.append('rect');
    g.append("foreignObject");

    function update() {

        g.select('rect')
            .attr('x', vm.x())
            .attr('y', vm.y())
            .attr('width', vm.width())
            .attr('height', vm.height())
            .classed('selected', d => d.selected())
        ;

        g.select('foreignObject')
            .attr('x', d => d.x() + margin)
            .attr('y', d => d.y() + margin)
            .attr('width', d => d.width() - margin * 2)
            .attr('height', d => d.height() - margin * 2)
            .html(d => '<pre>' + d.text() + '</pre>');

    };

    update();

    vm.hash.subscribe(function (data) {
        update();
    });
};