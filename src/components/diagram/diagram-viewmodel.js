var ko = require('knockout');
var vmFactory = require('./../components').ViewModelFactory;

module.exports = function (data) {
    var self = this;

    // designer

    self.id = ko.observable(data.id);
    self.component = ko.computed(() => data.component); // readonly
    self.maxThreadCount = ko.observable(data.maxThreadCount || 100).extend({dataType: "integer", range: {min: 1, max: 500}});

    self.designerParams = [self.maxThreadCount];

    // not visible observables:

    self.showParams = ko.observable(true);
    self.dragging = ko.observable(false);
    self.linking = ko.observable(null);

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

    // loading:

    var _viewModelArray = [];
    if (data.elements) {
        for (var i = 0; i < data.elements.length; i++) {
            var vm = vmFactory(data.elements[i], self);
            _viewModelArray.push(vm);
        }
    }

    //! load links:

    self.elements = ko.observableArray(_viewModelArray);

    // commands:

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
        var vm = vmFactory({id: id, component: component, x: x, y: y}, self);  // create ViewModel with default data
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

    // public functions:

    self.getViewModelById = (id) => self.elements.filter(item => item.id() == id)[0];

};