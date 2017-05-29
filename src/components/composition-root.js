var components = require('./components');

components.register(
    'diagram',
    require('./diagram/diagram-view-model'),
    require('./diagram/diagram-view')
);

components.register(
    'simpleblock',
    require('./simpleblock/simpleblock-viewmodel'),
    require('./simpleblock/simpleblock-view')
);


module.exports.run = function (parentNode) {
    var diagramData = {component: 'diagram'};
    var vm = components.ViewModelFactory(diagramData);
    var v = components.ViewFactory(vm, parentNode);
};