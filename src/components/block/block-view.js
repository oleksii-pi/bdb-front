var d3 = require('d3');
require('./block.css');
var ko = require('knockout');

const margin = 4;
const resizeRectSize = 5;
const linkRadius = 6;

module.exports = function(vm, parentNode) {
    var g = d3.select(parentNode);

    g.attr("class", "element block");

    g.append('circle')
        .attr("class", "linkIn")
        .attr("r", linkRadius)
    ;
    g.append('rect');
    g.append('foreignObject');
    g.append('rect')
        .attr("class", "resizeRect")
        .attr('width', resizeRectSize)
        .attr('height', resizeRectSize)
    ;

    g.select('foreignObject')
        .html(d =>
`<div class="elementTitle" data-bind="text: title"></div>
<div class="singleton" data-bind="visible: singleton">singleton</div>
<table >
    <tbody data-bind="foreach: paramsViewModel">
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

        g.select('.linkIn')
            .attr('cx', vm.x() + vm.width() / 2)
            .attr('cy', vm.y() - linkRadius)
        ;

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

        //// out links:

        var outLinksCount = vm.outLinksViewModel().length;
        var sectionLength = vm.width() / outLinksCount;

        var outLinks = g.selectAll('g.linkOut')
            .data(vm.outLinksViewModel());
        outLinks.exit().remove();

        var outLinkGroups = outLinks
            .enter()
            .append('g')
            .attr('class', 'linkOut');

        outLinkGroups.append('circle')
            .attr('r', linkRadius);

        outLinkGroups.append('text');

        outLinks = outLinkGroups.merge(outLinks);

        outLinks.select('circle')
            .each(function(data, index) {
                var cx = vm.x() + index * sectionLength + sectionLength / 2;
                var cy = vm.y() + vm.height() + linkRadius;
                d3.select(this)
                    .attr("cx", cx)
                    .attr("cy", cy);
            });

        outLinks.select('text')
            .each(function(data, index) {
                console.log(data, index);
                var cx = vm.x() + index * sectionLength + sectionLength / 2;
                var cy = vm.y() + vm.height() - linkRadius;
                d3.select(this)
                    .attr("x", cx)
                    .attr("y", cy)
                    .html(data)
                ;
            });
    };

    update();

    vm.hash.subscribe(function (data) {
        update();
    });
};