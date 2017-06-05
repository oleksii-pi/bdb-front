require('./params.css');
require('./codemirror-theme.css');
var CodeMirror = require('codemirror/lib/codemirror');
require('codemirror/mode/javascript/javascript');
require('codemirror/addon/edit/matchbrackets');

module.exports.init = function () {
    var editor = CodeMirror.fromTextArea($('#codeEditor')[0], {
        mode: "javascript",
        //theme: "default",
        matchBrackets:true,
        //lineNumbers: true
    });


};