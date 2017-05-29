var components = require('./components');

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


module.exports.run = function (parentNode) {
    var diagramData = {component: 'diagram', id: 'diagram1'};
    var vm = components.ViewModelFactory(diagramData);
    var v = components.ViewFactory(vm, parentNode);
};