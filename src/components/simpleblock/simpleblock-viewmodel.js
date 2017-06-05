var ko = require('knockout');
var vmFactory = require('./../components').ViewModelFactory;
var inheritBaseComponent = require('./../base-component');

module.exports = function (data) {
    inheritBaseComponent(this, data);

    var self = this;

    self.singleton = ko.observable(data.singleton).extend({dataType: "boolean"});
    self.params = ko.observable(data.params).extend({dataType: "json"});
    self.code = ko.observable(data.code || '// block code');

    self.addViewChangers(self.params); // if need
    self.blockParams.push(self.singleton, self.params);
};