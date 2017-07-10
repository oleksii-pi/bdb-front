var ko = require('knockout');
var vmFactory = require('./../components').ViewModelFactory;
var jsonDiff = require('deep-diff').default;

const saveDiagramInterval = 300;

module.exports = function (data) {
    var self = this;

    self.init = function() {
        self.id = ko.observable();
        self.component = ko.computed(() => 'diagram'); // readonly, const
        self.maxThreadCount = ko.observable(100).extend({dataType: "integer", range: {min: 1, max: 500}});
        self.showCage = ko.observable(false).extend({dataType: "boolean"});
        self.straightLinks = ko.observable(false).extend({dataType: "boolean"});
        self.loadingData = ko.observable(false).extend({dataType: "boolean"}); //! get rid of this

        self.elements = ko.observableArray([]);
        self.links = ko.observableArray([]);

        // not visible observables:
        self.showParams = ko.observable(true);
        self.dragging = ko.observable(false);
        self.linking = ko.observable(null);

        self.undoRedo = ko.observable(false);
        self.saving = ko.observable(false).extend({ notify: 'always' });;
        self.maxUndoCount = ko.observable(100);
        self.undoActions = ko.observableArray([]);
        self.redoActions = ko.observableArray([]);

        self.serializeParams = () => [self.id, self.component, self.maxThreadCount, self.showCage, self.straightLinks];

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

        self.json = ko.computed({
            read: self.save,
            write: function(value) {
                if (self.loadingData()) {
                    self.loadingData(false);
                    self.load(value);
                }
            }
        }).extend({ rateLimit: { timeout: saveDiagramInterval, method: "notifyWhenChangesStop" } }).extend({dataType: 'string'});

        // view params:
        self.designerParams = [self.maxThreadCount, self.showCage, self.straightLinks, self.loadingData, self.json];

        // commands:

        var genNewId = function(component) {
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
            var vm = vmFactory(component);
            initElementSubscriptions(vm);
            vm.load({id: id, component: component, x: x, y: y}); // create ViewModel with default data
            self.commandDeselectAll();
            vm.commandSelect();
            self.elements.push(vm);
        };

        self.commandDeleteSelected = function() {
            var elementsForDelete = self.elements().filter(element => element.selected());
            elementsForDelete.forEach(element => {
                self.links.remove(link => link.source() == element.id()).forEach(link => link.dispose());
                self.links.remove(link => link.destination() == element.id()).forEach(link => link.dispose());
                element.dispose();
            });
            self.elements.remove(element => element.selected());
            var linksForDelete = self.links().filter(link => link.selected());
            linksForDelete.forEach(link => link.dispose());
            self.links.remove(link => link.selected());
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
                var vm = vmFactory('link');  // create ViewModel with default data
                initElementSubscriptions(vm);
                vm.load(linkData);
                vm.commandSelect();
                linking(vm);
                self.links.push(vm);
            }
        };

        self.commandEndLink = function(destinationViewModel) {
            var linking = self.linking;
            if (linking()) {
                var linkVM = linking();
                linkVM.path.pop(); // last point under mouse
                linkVM.destination(destinationViewModel.id());
                linking(null);
            }
        };

        self.commandCancelLink = function () {
            var linking = self.linking;
            if (linking()) {
                linking().dispose();
                var index = self.links.indexOf(linking());
                if (index > -1) {
                    self.links.splice(index, 1);
                }
                linking(null);
            }
        };

        self.commandSelectAll = function() {
            self.elements().forEach(element => element.selected(true));
            self.links().forEach(link => link.selected(true));
        };

        self.commandDeleteAll = function() {
            self.links().forEach(link => link.dispose());
            self.links.removeAll();
            self.elements().forEach(element => element.dispose());
            self.elements.removeAll();
        };

        // copy & paste:

        var _clipboard;

        self.commandCopySelectedToClipboard = function() {
            var data = {};
            data.elements = [];
            data.links = [];

            self.elements().forEach(element => {
                if (element.selected()) {
                    data.elements.push(serializeComponent(element));
                }
            });
            self.links().forEach(link => {
                if (link.selected()
                        && link.source()
                        && link.destination()
                        && self.getViewModelById(link.source())
                        && self.getViewModelById(link.destination())
                        && self.getViewModelById(link.source()).selected()
                        && self.getViewModelById(link.destination()).selected()
                    ) {
                    data.links.push(serializeComponent(link));
                }
            });

            var json = JSON.stringify(data, null, 2);
            _clipboard = json;
        };

        self.commandPasteFromClipboard = function() {
            self.commandDeselectAll();

            var data;
            try {
                data = JSON.parse(_clipboard);
            } catch (err) {
                return;
            }

            var elementsIdMap = {};

            // loading elements, than links:
            if (data.elements) {
                for (var i = 0; i < data.elements.length; i++) {
                    var elementData = data.elements[i];
                    var component = elementData.component;

                    var oldId = elementData.id;
                    var newId = genNewId(component);
                    elementData.id = newId;
                    elementsIdMap[oldId] = newId;

                    var vm = vmFactory(component);
                    initElementSubscriptions(vm);
                    vm.load(elementData);
                    vm.selected(true);
                    self.elements.push(vm);
                }
            }

            if (data.links) {
                for (var i = 0; i < data.links.length; i++) {
                    var newId = genNewId('link');
                    var linkData = data.links[i];
                    linkData.id = newId;
                    linkData.source = elementsIdMap[linkData.source];
                    linkData.destination = elementsIdMap[linkData.destination];

                    var vm = vmFactory('link');
                    initElementSubscriptions(vm);
                    vm.load(linkData);
                    vm.selected(true);
                    self.links.push(vm);
                }
            }
        };

        self.commandCut = function() {
            self.commandCopySelectedToClipboard();
            self.commandDeleteSelected();
        };

        self.commandDuplicate = function() {
            self.commandCopySelectedToClipboard();
            self.commandPasteFromClipboard();
        };

        // undo, redo:

        // auto save, undo, redo:

        var operationFinished = function(newValue) {
            if (!newValue) {
                self.json.notifySubscribersImmediately(self.json());
            }
        };

        self.dragging.subscribe(operationFinished);
        self.linking.subscribe(operationFinished);

        var _json;
        self.json.subscribe(function(newValue) {
            // can be called multiple times with the same newValue (after dragging, linking: they force immediate update)

            if (self.undoRedo()) {
                _json = newValue;
                self.undoRedo(false);
                return;
            }

            if (!self.dragging() && !self.linking() && _json != newValue) {
                if (_json) {
                    var oldObj = JSON.parse(_json);
                    var newObj = JSON.parse(newValue);

                    var difference = jsonDiff.diff(oldObj, newObj);
                    if (difference) {
                        self.undoActions.push(difference);
                        if (self.undoActions().length > self.maxUndoCount()) {
                            self.undoActions(self.undoActions.slice(-self.maxUndoCount()));
                        }
                        self.redoActions([]);
                    } else
                        console.error('Unexpected undefined difference between diagram json old and new values');
                }

                _json = newValue;
            }
        });

        self.commandUndo = function() {
            var difference = self.undoActions.pop();
            if (difference) {
                self.redoActions.push(difference.slice());
                var json = JSON.parse(self.json());
                difference.reverse();
                difference.forEach(change => jsonDiff.revertChange(json, {}, change));
                var jsonString = JSON.stringify(json);

                self.undoRedo(true);
                self.loadingData(true);
                self.json(jsonString);
            }
        };

        self.commandRedo = function() {
            var difference = self.redoActions.pop();
            if (difference) {
                self.undoActions.push(difference.slice());
                var json = JSON.parse(self.json());
                difference.reverse();
                difference.forEach(change => jsonDiff.applyChange(json, {}, change));
                var jsonString = JSON.stringify(json);

                self.undoRedo(true);
                self.loadingData(true);
                self.json(jsonString);
            }
        };

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

    };

    self.load = function(data) {
        if (typeof data === 'string') {
            data = JSON.parse(data);
        }

        self.dragging(false);
        self.linking(null);
        self.commandDeleteAll();

        ko.tasks.runEarly(); // force view update for deleting data

        self.id(data.id);
        self.maxThreadCount(data.maxThreadCount || 100);
        self.showCage(data.showCage || false);

        // loading elements, than links:
        var _viewModelArray = [];
        if (data.elements) {
            for (var i = 0; i < data.elements.length; i++) {
                var vm = vmFactory(data.elements[i].component);
                initElementSubscriptions(vm);
                vm.load(data.elements[i]);
                _viewModelArray.push(vm);
            }
        }
        self.elements(_viewModelArray);

        var _linksArray = [];
        if (data.links) {
            for (var i = 0; i < data.links.length; i++) {
                var vm = vmFactory('link');
                initElementSubscriptions(vm);
                vm.load(data.links[i]);
                _linksArray.push(vm);
            }
        }
        self.links(_linksArray);

        self.json.notifySubscribersImmediately(self.json()); // fix of initial undo saving
    };

    function initElementSubscriptions(vm) {
        // blocks:

        if (vm.idBeforeChange) {
            vm.idBeforeChange(function(newValue, oldValue) {
                var allowIdRename = !self.getViewModelById(newValue);

                if (allowIdRename) {
                    self.links().forEach(link => {
                        if (link.source() == oldValue) {
                            link.source(newValue);
                        }
                        if (link.destination() == oldValue) {
                            link.destination(newValue);
                        }
                    });
                }
                return allowIdRename;
            });
        }

        if (vm.commandStartLink) {
            vm.commandStartLink = (outIndex) => {
                self.commandStartLink(vm, outIndex);
            };
        }

        if (vm.commandEndLink) {
            vm.commandEndLink = () => {
                self.commandEndLink(vm);
            };
        }

        if (vm.getDiagramLinksCount) {
            vm.getDiagramLinksCount = self.getElementOutLinksCount;
        }

        if (vm.diagramLinking) {
            vm.diagramLinking = self.linking;
        }

        // links:

        if (vm.commandCancelLink) {
            vm.commandCancelLink = self.commandCancelLink;
        }

        if (vm.diagramGetViewModelById) {
            vm.diagramGetViewModelById = self.getViewModelById;
        }

        if (vm.diagramStraightLinks) {
            vm.diagramStraightLinks = self.straightLinks;
        }
    };

    function serializeComponent(component) {
        var result = {};
        var params = component.serializeParams();
        params.forEach(param => {
            var paramName = Object.keys(component)[ Object.values(component).indexOf(param)];
            result[paramName] = param();
        })
        return result;
    };

    self.save = function() {
        var data = serializeComponent(self);
        data.elements = [];
        data.links = [];
        self.elements().forEach(element => data.elements.push(serializeComponent(element)));
        self.links().forEach(link => data.links.push(serializeComponent(link)));
        var json = JSON.stringify(data, null, 2);

        self.saving(true);

        return json;
    };

    self.dispose = function() {
        [self.component, self.selectedElement, self.json]
            .forEach(item => item.dispose());
    };

    self.init();

};