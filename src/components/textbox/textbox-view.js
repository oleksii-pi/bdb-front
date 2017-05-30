var d3 = require('d3');
require('./textbox.css');

const margin = 4;

module.exports = function(vm, parentNode) {
    var g = d3.select(parentNode);

    g.append('rect').attr("class", "element textbox");
    g.append('text');
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
            .html(d => '<div>' + d.text() + '</div>');

    };

    update();

    vm.hash.subscribe(function (data) {
        update();
    });
};