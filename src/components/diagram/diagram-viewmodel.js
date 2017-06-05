var ko = require('knockout');
var vmFactory = require('./../components').ViewModelFactory;

var functor = function(value) {
    return typeof value === "function" ? v : function() {
        return arguments.length ? value = arguments[0] : value;
    };
};

module.exports = function (data) {
    var self = this;

    // designer

    self.id = ko.observable(data.id);
    self.component = ko.computed(() => data.component); // readonly
    self.maxThreadCount = ko.observable(data.maxThreadCount || 100).extend({dataType: "integer", range: {min: 1, max: 500}});

    self.params = [self.maxThreadCount];

    //

    self.showParams = ko.observable(true);
    self.showCodeEditor = ko.observable(true);

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

    self.commandResizeSelected = function(deltaX, deltaY) {
        self.elements().forEach(item => {
            if (item.selected()) {
                item.width(item.width() + deltaX);
                item.height(item.height() + deltaY);
            }
        });
    };

    self.commandDeselectAll = function() {
        self.elements().forEach(item => item.selected(false));
    };

    self.selectedElement = ko.computed(function(){
        var selectedCount = self.elements().filter(item => item.selected()).length;

        if (selectedCount == 0) {
            return self;
        }

        if (selectedCount == 1) {
            var selectedElement = self.elements().filter(item => item.selected())[0];
            return selectedElement;
        }
    });
};