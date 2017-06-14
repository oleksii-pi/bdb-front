var ko = require('knockout');
var inheritBaseComponent = require('./../base-component');

module.exports = function () {
    var self = this;
    inheritBaseComponent(this, 'textbox');

    var _init = self.init;
    self.init = function() {
        _init.apply(this, arguments);

        self.text = ko.observable().extend({dataType: "string"});

        self.addViewChangers(self.text);
        self.designerParams.splice(0, 0, self.text);
    }

    var _load = self.load;
    self.load = function(data) {
        _load.apply(this, arguments);

        self.text(data.text || data.id);
    }

    var _dispose = self.dispose;
    self.dispose = function() {
        _dispose.apply(this, arguments);

        // no computed
    }

    self.init();
};