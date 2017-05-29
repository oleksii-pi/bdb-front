var ko = require('knockout');
var vmFactory = require('./../components').ViewModelFactory;

var functor = function(value) {
    return typeof value === "function" ? v : function() {
        return arguments.length ? value = arguments[0] : value;
    };
};

module.exports = function (data) {
    var self = this;

    self.id = () => data.id; // readonly
    self.component = () => data.component; // readonly

    var vms = [];
    if (data.elements) {
        for (var i = 0; i < data.elements.length; i++) {
            var vm = vmFactory(data.elements[i]);
            vms.push(vm);
        }
    }

    self.elements = ko.observableArray(vms);

    self.hash = ko.computed(function(){
        return self.elements().map(item => item.hash());
    });

    self.dragging = functor(false);

    function genNewId(component) {
        var maxId = 0;
        self.elements().forEach(item => {
            if (item.component() == component) {
            var id = +item.id().substr(component.length);
            if (maxId < id) maxId = id;
        }
    });
        return component + (++maxId);
    };

    self.commandAdd = function (x, y, component) {
        var id = genNewId(component);
        var vm = vmFactory({id: id, component: component, x: x, y: y});  // create ViewModel with default data
        self.commandDeselectAll();
        vm.commandSelect();
        self.elements.push(vm);
    };

    self.commandDeleteSelected = function() {
        self.elements.remove(item => item.selected());
    };

    self.commandMoveSelected = function(deltaX, deltaY) {
        self.elements().forEach(item => {
            if (item.selected()) {
            item.x(item.x() + deltaX);
            item.y(item.y() + deltaY);
        }
    });
    };

    self.commandDeselectAll = function() {
        self.elements().forEach(item => item.selected(false));
    };
};