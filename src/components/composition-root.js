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


module.exports.run = function (svgParentNode) {
    //var diagramData = {component: 'diagram', id: 'diagram1'};

    //debug:
    var diagramData = {component: 'diagram', id: 'diagram1', elements: [{component: 'textbox', id: 'textbox1', text: 'Some big welcome text. Hello world!', x: 100, y: 100, width: 200, height: 100}]};

    var diagramViewModel = components.ViewModelFactory(diagramData);
    var diagramView = components.ViewFactory(diagramViewModel, svgParentNode);

    //debug initialize repaint:
    diagramViewModel.elements.valueHasMutated();

    diagramViewModel.elements()[0].commandSelect();

    ko.applyBindings(diagramViewModel); //! should be in another place
};