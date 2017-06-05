var CodeMirror = require('codemirror/lib/codemirror');

require('codemirror/lib/codemirror.css');
require('codemirror/mode/javascript/javascript');
require('codemirror/addon/edit/matchbrackets');

var ko = require('knockout');

require('./params.css');
require('./codemirror-theme.css');

// https://stackoverflow.com/a/17489451/3818473
ko.bindingHandlers.codemirror = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var options = valueAccessor();
        var editor = CodeMirror.fromTextArea(element, options);

        editor.on('change', function(cm) {
            allBindingsAccessor().value(cm.getValue());
        });

        element.editor = editor;

        if (allBindingsAccessor().value()) {
            editor.setValue(allBindingsAccessor().value());
        }
        editor.refresh();

        var wrapperElement = $(editor.getWrapperElement());
        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            wrapperElement.remove();
        });
    },
    update: function (element, valueAccessor) {
        if(element.editor)
            element.editor.refresh();
    }
};