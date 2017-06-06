var ko = require('knockout');

module.exports = function (component, data) {
    var self = component;

    self.id = ko.observable(data.id);
    self.component = ko.computed(() => data.component); // readonly
    self.x = ko.observable(data.x).extend({dataType: "float", precision: 2});
    self.y = ko.observable(data.y).extend({dataType: "float", precision: 2});
    self.width = ko.observable(data.width || 50).extend({dataType: "float", precision: 2, range: {min: 50, max: 500}});
    self.height = ko.observable(data.height || 50).extend({dataType: "float", precision: 2, range: {min: 50, max: 500}});
    self.selected = ko.observable(false);

    self.commandSelect = function() {
        self.selected(!self.selected());
    };

    // designer params:
    self.blockParams = [self.x, self.y, self.width, self.height];

    var _viewChangers = [];
    self.addViewChangers = function () {
        for (var i = 0; i < arguments.length; i++) {
            _viewChangers.push(arguments[i]);
        }
        self.hash = ko.pureComputed(() => _viewChangers.map(item => item()));
    };

    // add observables that affects view render:
    self.addViewChangers(self.id, self.x, self.y, self.width, self.height, self.selected);
}