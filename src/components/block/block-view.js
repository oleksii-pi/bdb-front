var d3 = require('d3');
require('./block.css');
var ko = require('knockout');

const margin = 4;
const resizeRectSize = 5;

module.exports = function(vm, parentNode) {
    var g = d3.select(parentNode);

    g.attr("class", "element block");

    g.append('rect');
    g.append('foreignObject');
    g.append('rect')
        .attr("class", "resizeRect")
        .attr('width', resizeRectSize)
        .attr('height', resizeRectSize)
    ;

    g.select('foreignObject')
        .html(d =>
`<div class="elementTitle" data-bind="text: id"></div>
<label><input type="checkbox" data-bind="checked: singleton" /> singleton</label>
<table >
    <tbody data-bind="foreach: paramsView">
    <tr>
        <td data-bind="text: $rawData.key" />
        <td data-bind="text: $rawData.value" />
    </tr>
</table>`
    ).each(function (d) {
        //var bindingsApplied = !!ko.dataFor(this);
        //ko.cleanNode(this);
        ko.applyBindings(d, this); // Sets up Knockout to work with the node
    });

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
        ;

        g.select('.resizeRect')
            .attr('x', d => d.x() + d.width() - resizeRectSize)
            .attr('y', d => d.y() + d.height() - resizeRectSize)
            .attr('visibility', d => d.selected() ? 'visible' : 'hidden')
            .call(d3.drag().on("drag", () => {
                //vm.commandResize(d3.event.x - vm.x(), d3.event.y - vm.y());
                vm.width(d3.event.x - vm.x());
                vm.height(d3.event.y - vm.y());
            }))
        ;

    };

    update();

    vm.hash.subscribe(function (data) {
        update();
    });
};