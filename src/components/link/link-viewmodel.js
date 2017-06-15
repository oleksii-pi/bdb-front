var ko = require('knockout');

module.exports = function () {
    var self = this;

    self.init = function() {
        self.id = ko.observable();
        self.component = ko.computed(() => 'link');
        self.selected = ko.observable(false);

        self.source = ko.observable();
        self.sourceOutIndex = ko.observable();
        self.destination = ko.observable();
        self.path = ko.observableArray([]);

        self.diagramStraightLinks = () => {}; // will be overridden by diagram

        // computed:
        self.diagramGetViewModelById = () => {}; // will be overridden by diagram

        var _sourceVM = () => self.diagramGetViewModelById(self.source());
        var _destinationVM = () => self.diagramGetViewModelById(self.destination());

        self.fullPath = ko.pureComputed(() => {
            var result = [];

            if (_sourceVM()) {
                var x1 = _sourceVM().outLinksPoints()[self.sourceOutIndex()].x;
                var y1 = _sourceVM().outLinksPoints()[self.sourceOutIndex()].y;
                result.push([x1, y1]);
            };

            result = result.concat(self.path());

            if (_destinationVM()) {
                var xLast = _destinationVM().inLinkPointViewModel().x;
                var yLast = _destinationVM().inLinkPointViewModel().y;
                result.push([xLast, yLast]);
            }

            return result;
        });

        // commands:

        self.commandSelect = function() {
            self.selected(!self.selected());
        };

        self.commandCancelLink = () => {}; // will be overridden by diagram

        self.commandSetLastPoint = function(point) {
            self.path()[self.path().length - 1] = point;
            self.path.valueHasMutated();
        };

        self.commandAddPoint = function(point) {
            self.path.push(point);
        };

        //

        self.hash = ko.computed(() => {
            return [
                self.selected(),
                self.diagramStraightLinks()
            ].concat(self.fullPath());
        });

        self.designerParams = [];
        self.serializeParams = () => [self.id, self.component, self.source, self.sourceOutIndex, self.destination, self.path];

    };

    self.load = function(data) {
        self.id(data.id);
        self.selected(false);

        self.source(data.source);
        self.sourceOutIndex(data.sourceOutIndex);
        self.destination(data.destination);
        self.path = ko.observableArray(data.path || []);
    };

    self.dispose = () => {
        self.fullPath.dispose();
        self.hash.dispose();
    };

    self.init();
}