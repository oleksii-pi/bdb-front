var components = require('./components');
var ko = require('knockout');
require('./knockout-init');

components.register(
    'diagram',
    require('./diagram/diagram-viewmodel'),
    require('./diagram/diagram-view')
);

components.register(
    'simpleblock',
    require('./simpleblock/simpleblock-viewmodel'),
    require('./simpleblock/simpleblock-view')
);

components.register(
    'textbox',
    require('./textbox/textbox-viewmodel'),
    require('./textbox/textbox-view')
);

components.register(
    'block',
    require('./block/block-viewmodel'),
    require('./block/block-view')
);

components.register(
    'link',
    require('./link/link-viewmodel'),
    require('./link/link-view')
);

module.exports.run = function (svgParentNode) {
    //var diagramData = {component: 'diagram', id: 'diagram1'};

    //debug:
    var diagramData = {component: 'diagram', id: 'diagram1', elements: [{component: 'textbox', id: 'textbox1', text: 'Some big welcome text.\nHello world!\n1\n2', x: 10, y: 10, width: 200, height: 100}]};

    var diagramViewModel = components.ViewModelFactory(diagramData);
    var diagramView = components.ViewFactory(diagramViewModel, svgParentNode);

    //debug initialize repaint:
    diagramViewModel.elements.valueHasMutated();
    //debug initialize selection:
    diagramViewModel.elements()[0].commandSelect();

    ko.applyBindings(diagramViewModel, $('#params')[0]); //! should be in another place ; consider: ko.applyBindings(diagramViewModel, paramsNode)
};