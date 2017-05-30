var ko = require('knockout');
var vmFactory = require('./../components').ViewModelFactory;

module.exports = function (data) {
    var self = this;

    self.id = () => data.id; // readonly
    self.component = () => data.component; // readonly
    self.x = ko.observable(data.x);
    self.y = ko.observable(data.y);
    self.width = ko.observable(data.width || 100);
    self.height = ko.observable(data.height || 50);
    self.selected = ko.observable(false);

    self.text = ko.observable(data.text || data.id);

    self.hash = ko.computed(function(){
        return [self.x(), self.y(), self.width(), self.height(), self.selected(), self.text()];
    });

    self.commandSelect = function() {
        self.selected(!self.selected());
    };
};