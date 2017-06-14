var ko = require('knockout');
var vmFactory = require('./../components').ViewModelFactory;

module.exports = function (data) {
    var self = this;

    self.init = function() {
        self.id = ko.observable();
        self.component = ko.computed(() => 'diagram'); // readonly, const
        self.maxThreadCount = ko.observable(100).extend({dataType: "integer", range: {min: 1, max: 500}});
        self.showCage = ko.observable(false).extend({dataType: "boolean"});
        self.elements = ko.observableArray([]);
        self.links = ko.observableArray([]);

        // not visible observables:
        self.showParams = ko.observable(true);
        self.dragging = ko.observable(false);
        self.linking = ko.observable(null);

        self.serializeParams = () => [self.id, self.component, self.maxThreadCount, self.showCage];

        // computed:
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

        self.json = ko.computed({ read: self.save, write: () => { } }).extend({dataType: 'javascript'});

        // commands:

        function genNewId(component) {
            var maxId = 0;
            if (component == 'link') {
                self.links().forEach(item => {
                    var id = +item.id().substr(component.length);
                    if (maxId < id) maxId = id;
                });
                return component + (++maxId);
            }
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
            var elementsForDelete = self.elements().filter(element => element.selected());
            elementsForDelete.forEach(element => {
                self.links.remove(link => link.source() == element.id()).forEach(link => link.dispose());
                self.links.remove(link => link.destination() == element.id()).forEach(link => link.dispose());
            });
            self.elements.remove(element => element.selected());
            self.links.remove(link => link.selected()).forEach(link => link.dispose());
        };

        self.commandMoveSelected = function(deltaX, deltaY) {
            self.elements().forEach(item => {
                if (item.selected()) {
                    item.x(item.x() + deltaX);
                    item.y(item.y() + deltaY);
                }
            });
            self.links().forEach(link => {
                if (link.selected()) {
                    link.path().forEach(point => {
                        point[0] += deltaX;
                        point[1] += deltaY;
                    });
                    link.path.valueHasMutated();
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
            self.links().forEach(item => item.selected(false));
        };

        // linking commands:
        self.commandStartLink = function(sourceViewModel, sourceOutIndex) {
            var linking = self.linking;
            if (!linking()) {
                self.commandDeselectAll();

                var id = genNewId('link');
                var linkData = {id: id, component: 'link', source: sourceViewModel.id(), sourceOutIndex: sourceOutIndex};
                var vm = vmFactory(linkData, self);  // create ViewModel with default data
                vm.commandSelect();
                linking(vm);
                self.links.push(vm);
            }
        };

        self.commandEndLink = function(destinationViewModel) {
            var linking = self.linking;
            if (linking()) {
                var linkVM = linking();
                linkVM.destination(destinationViewModel.id());
                linking(null);
            }
        };

        self.commandCancelLink = function () {
            var linking = self.linking;
            if (linking()) {
                var index = self.links.indexOf(linking());
                if (index > -1) {
                    self.links.splice(index, 1);
                }
                linking(null);
            }
        }

        // public functions:
        self.getViewModelById = (id) => {
            if (id == null || typeof id === 'undefined') {
                return null;
            }
            var found = self.elements().concat(self.links()).filter(item => item.id() == id);
            if (found.length == 1) {
                return found[0];
            }
            return null;
        };

        self.getElementOutLinksCount = (id) => {
            var maxIndex = -1;
            var indexes = self.links().filter(link => link.source() == id).map(link => link.sourceOutIndex());
            indexes.forEach(item => (item > maxIndex) ? maxIndex = item : 0);
            return maxIndex + 1;
        };

        // view params:
        self.designerParams = [self.maxThreadCount, self.showCage, self.json];
    };

    self.load = function(data) {
        self.id(data.id);
        self.maxThreadCount(data.maxThreadCount || 100);
        self.showCage(data.showCage || false);

        // loading elements, than links:
        var _viewModelArray = [];
        if (data.elements) {
            for (var i = 0; i < data.elements.length; i++) {
                var vm = vmFactory(data.elements[i], self);
                _viewModelArray.push(vm);
            }
        }
        self.elements(_viewModelArray);

        var _linksArray = [];
        if (data.links) {
            for (var i = 0; i < data.links.length; i++) {
                var vm = vmFactory(data.links[i], self);
                _linksArray.push(vm);
            }
        }
        self.links(_linksArray);
    };

    self.save = function() {
        function serializeComponent(component) {
            var result = {};
            var params = component.serializeParams();
            params.forEach(param => {
                var paramName = Object.keys(component)[ Object.values(component).indexOf(param)];
                result[paramName] = param();
            })
            return result;
        };

        var data = serializeComponent(self);
        data.elements = [];
        data.links = [];

        self.elements().forEach(element => data.elements.push(serializeComponent(element)));
        self.links().forEach(link => data.links.push(serializeComponent(link)));

        var json = JSON.stringify(data, null, 2);
        return json;
    };

    self.dispose = function() {
        [self.component, self.selectedElement, self.json]
            .forEach(item => item.dispose());
    };

    self.init();
    self.load(data);
};