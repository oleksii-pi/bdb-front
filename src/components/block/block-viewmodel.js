var ko = require('knockout');
var vmFactory = require('./../components').ViewModelFactory;
var inheritBaseComponent = require('./../base-component');

module.exports = function (data) {
    data.width = data.width || 200;
    data.height = data.height || 150;
    inheritBaseComponent(this, data);

    var self = this;

    self.singleton = ko.observable(data.singleton).extend({dataType: "boolean"});
    self.params = ko.observable(data.params || '').extend({dataType: "json"});
    self.code = ko.observable(data.code || '// block code');

    self.paramsView = ko.computed(() => {
        try {
            var json = JSON.parse(self.params());
        } catch (e) {
            return;
        }
        var keyValueArray = Object.keys(json).map(function(key) { return {key: key, value: json[key]} });
        return keyValueArray;
    });

    self.addViewChangers(self.params);
    self.blockParams.push(self.singleton, self.params);
};