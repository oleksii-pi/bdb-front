var ko = require('knockout');

module.exports = function (data, parentViewModel) {
    var self = this;

    self.id = ko.observable(data.id);
    self.component = ko.computed(() => data.component); // readonly
    self.selected = ko.observable(false);

    self.source = ko.observable(data.source);
    self.sourceOutIndex = ko.observable(data.sourceOutIndex);
    self.destination = ko.observable(data.destination);
    self.path = ko.observableArray(data.path || []);

    // computed:
    var _sourceVM = () => parentViewModel.getViewModelById(self.source());
    var _destinationVM = () => parentViewModel.getViewModelById(self.destination());

    self.fullPath = ko.computed(() => {
        var result = [];

        var x1 = _sourceVM().outLinksPoints()[self.sourceOutIndex()].x;
        var y1 = _sourceVM().outLinksPoints()[self.sourceOutIndex()].y;

        result.push([x1, y1]);
        result = result.concat(self.path());

        if (_destinationVM()) {
            var xLast = _destinationVM().inLinkPoint().x;
            var yLast = _destinationVM().inLinkPoint().y;
            result.push([xLast, yLast]);
        }

        return result;
    });



    // commands:

    self.commandSelect = function() {
        self.selected(!self.selected());
    };

    self.commandCancel = function() {
        parentViewModel.commandCancelLink();
    };

    self.commandSetLastPoint = function(point) {
        self.path()[self.path().length - 1] = point;
        self.path.valueHasMutated();
    };

    self.commandAddPoint = function(point) {
        self.path.push(point);
    };

    //

    self.destination.subscribe(function(newValue) {
        if (newValue) {
            self.path.pop();
        }
    });

    //

    self.hash = ko.computed(() => {
        return [
            self.selected()
        ].concat(self.fullPath());
    });

    self.designerParams = [];
}