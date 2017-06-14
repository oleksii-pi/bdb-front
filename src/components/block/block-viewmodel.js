var ko = require('knockout');
var inheritBaseComponent = require('./../base-component');

module.exports = function (data, parentViewModel) {
    data.width = data.width || 200;  // default while create new
    data.height = data.height || 150;
    inheritBaseComponent(this, data);

    var self = this;

    self.title = ko.observable(data.title || data.id).extend({dataType: "string"});
    self.singleton = ko.observable(data.singleton).extend({dataType: "boolean"});
    self.params = ko.observable(data.params || '').extend({dataType: "javascript"});
    self.code = ko.observable(data.code || '// block code');

    self.out = ko.observable(data.out || '').extend({dataType: "string"});

    self.paramsViewModel = ko.computed(() => {
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

    // linking:

    self.inLinkPointViewModel = ko.computed(() => ({x: self.x() + self.width() / 2, y: self.y()}));

    self.outLinksCount = ko.computed(() => {
        var outLinksTitlesCount = self.out().split(',').length;
        var diagramLinksCount = parentViewModel.getElementOutLinksCount(self.id());
        var max = Math.max(outLinksTitlesCount, diagramLinksCount);
        return max;
    });

    self.outLinksViewModel = ko.computed(() => {
        var result = self.out().split(',').map(item => item.trim()); // bug'o'feature: returns [''] for empty string

        var delta = self.outLinksCount() - result.length; // diagram can allready has more links than link titles
        if (delta > 0) {
            result = result.concat(new Array(delta).fill(''));
        }
        return result;
    });

    self.outLinksPoints = ko.computed(() => {
        var outLinksCount = self.outLinksCount();
        var sectionLength = self.width() / outLinksCount;

        var result = new Array(outLinksCount).fill().map((item, index) => (
            {
                x: self.x() + index * sectionLength + sectionLength / 2,
                y: self.y() + self.height()
            }));
        return result;
    });

    self.commandStartLink = (outIndex) => {
        parentViewModel.commandStartLink(self, outIndex);
    };

    self.commandEndLink = () => {
        parentViewModel.commandEndLink(self);
    };

    self.linking = ko.computed(() => parentViewModel.linking());

    //

    self.addViewChangers(self.title, self.singleton, self.params, parentViewModel.linking, self.out);
    self.designerParams.splice(0, 0, self.title);
    self.designerParams.push(self.singleton, self.params, self.out);

    self.serializeParams = () => [self.id, self.component].concat(self.designerParams).concat(self.code);
};