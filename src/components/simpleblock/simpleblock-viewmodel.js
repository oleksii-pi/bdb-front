var ko = require('knockout');
var inheritBaseComponent = require('./../base-component');

module.exports = function () {
    var self = this;

    inheritBaseComponent(self, 'simpleblock');

    var _init = self.init;
    self.init = function() {
        _init.apply(this, arguments);

        self.singleton = ko.observable().extend({dataType: "boolean"});
        self.params = ko.observable().extend({dataType: "json"});
        self.code = ko.observable();

        //self.addViewChangers(); // nothing changes  view
        self.designerParams.push(self.singleton, self.params);
    }

    var _load = self.load;
    self.load = function(data) {
        _load.apply(this, arguments);

        self.singleton(data.singleton);
        self.params(data.params);
        self.code(data.code || '// block code');
    }

    var _dispose = self.dispose;
    self.dispose = function() {
        _dispose.apply(this, arguments);

        // no computed
    }

    self.init();
};