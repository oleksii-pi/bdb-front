var ko = require('knockout');

module.exports = function (component, componentName) {
    var self = component;

    self.init = function() {
        self.idBeforeChange = ko.observable((newValue, oldValue) => true); // will be overridden by diagram

        self.id = ko.observable().extend({beforeChange: self.idBeforeChange});
        self.component = ko.computed(() => componentName); // readonly
        self.x = ko.observable().extend({dataType: "float", precision: 2});
        self.y = ko.observable().extend({dataType: "float", precision: 2});
        self.width = ko.observable().extend({dataType: "float", precision: 2, range: {min: 50, max: 500}});
        self.height = ko.observable().extend({dataType: "float", precision: 2, range: {min: 50, max: 500}});
        self.selected = ko.observable(false);

        //

        self.designerParams = [self.x, self.y, self.width, self.height];
        self.serializeParams = () => [self.id, self.component].concat(self.designerParams);

        // commands:

        self.commandSelect = function() {
            self.selected(!self.selected());
        };

        var _viewChangers = [];
        self.addViewChangers = function () {
            for (var i = 0; i < arguments.length; i++) {
                _viewChangers.push(arguments[i]);
            }
            self.hash = ko.pureComputed(() => _viewChangers.map(item => item()));
        };

        // add observables that affects view render:
        self.addViewChangers(self.id, self.x, self.y, self.width, self.height, self.selected);
    };

    self.load = function(data) {
        self.id(data.id);
        self.x(data.x);
        self.y(data.y);
        self.width(data.width || 50);
        self.height(data.height || 50);
    };

    self.dispose = function() {
        self.idBeforeChange = null;
    };
}