var ko = require('knockout');
var inheritBaseComponent = require('./../base-component');

module.exports = function (data) {
    data.width = data.width || 200;  // default while create new
    data.height = data.height || 150;
    inheritBaseComponent(this, data);

    var self = this;

    self.singleton = ko.observable(data.singleton).extend({dataType: "boolean"});
    self.params = ko.observable(data.params || '').extend({dataType: "json"});
    self.code = ko.observable(data.code || '// block code');

    self.paramsView = ko.computed(() => {
        try {
            var params = self.params();
            var keyValueArray = params
                .split(';')
                .filter(item => item.indexOf('=') != -1)
                .map(item => {
                return {key: item.split('=')[0].trim(), value: item.split('=')[1].trim()} ;
            });
            return keyValueArray;
        } catch (e) {
            return;
        }

    });

    self.addViewChangers(self.singleton, self.params);
    self.blockParams.push(self.singleton, self.params);
};