var ko = require('knockout');
var inheritBaseComponent = require('./../base-component');

module.exports = function () {
    var self = this;

    inheritBaseComponent(self, 'block');

    var _init = self.init;
    self.init = function() {
        _init.apply(this, arguments);

        self.title = ko.observable().extend({dataType: "string"});
        self.singleton = ko.observable().extend({dataType: "boolean"});
        self.params = ko.observable().extend({dataType: "javascript"});
        self.code = ko.observable();
        self.out = ko.observable('').extend({dataType: "string"});

        // will be overridden by diagram
        self.commandStartLink = (outIndex) => { };
        self.commandEndLink = () => { };
        self.getDiagramLinksCount = () => { return 0;};
        self.diagramLinking = () => {};
        self.linking = ko.computed(() => self.diagramLinking());

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
            var diagramLinksCount = self.getDiagramLinksCount(self.id());
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

        //

        self.addViewChangers(self.title, self.singleton, self.params, self.linking, self.out);
        self.designerParams.splice(0, 0, self.title);
        self.designerParams.push(self.singleton, self.params, self.out);

        self.serializeParams = () => [self.id, self.component].concat(self.designerParams).concat(self.code);
    }

    var _load = self.load;
    self.load = function(data) {
        data.width = data.width || 200;  // default while create new
        data.height = data.height || 150;

        _load.apply(this, arguments);

        self.title(data.title || data.id);
        self.singleton(data.singleton);
        self.params(data.params || '');
        self.code(data.code || '// block code');
        self.out(data.out || '');
    }

    var _dispose = self.dispose;
    self.dispose = function() {
        _dispose.apply(this, arguments);
        [
            self.paramsViewModel,
            self.linking,
            self.inLinkPointViewModel,
            self.outLinksCount,
            self.outLinksViewModel,
            self.outLinksPoints
        ].forEach(item => item.dispose());
    };

    self.init();
};