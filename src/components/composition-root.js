var components = require('./components');

module.exports.init = function () {
    components.register(
        'diagram',
        require('./diagram/diagram-viewmodel'),
        require('./diagram/diagram-view')
    );

    components.register(
        'simpleblock',
        require('./simpleblock/simpleblock-viewmodel'),
        require('./simpleblock/simpleblock-view')
    );

    components.register(
        'textbox',
        require('./textbox/textbox-viewmodel'),
        require('./textbox/textbox-view')
    );

    components.register(
        'block',
        require('./block/block-viewmodel'),
        require('./block/block-view')
    );

    components.register(
        'link',
        require('./link/link-viewmodel'),
        require('./link/link-view')
    );
}

var data =
    {
        "id": "diagram1",
        "component": "diagram",
        "maxThreadCount": 100,
        "showCage": true,
        "straightLinks": false,
        "elements": [
            {
                "id": "textbox1",
                "component": "textbox",
                "text": "You can:\n- add new Block (alt + click)\n- each block can contain code, \nthat will be executed by engine\n- select multiple elements with shift\n- move selected with mouse or keyboard\n  (plus shift for accuracy)\n- delete selected (backspace, del)\n- resize selected with alt \n(plus shift for accuracy)\n- scale with mouse scroll or touch gestures\n- save and load diagram JSON\n- ctrl + C, V, X, A\n- undo/redo (ctrl/command + [shift] + Z)",
                "x": 21.74,
                "y": 7.98,
                "width": 300,
                "height": 250
            },
            {
                "id": "start",
                "component": "block",
                "title": "Start",
                "x": 405.2,
                "y": 26.8,
                "width": 232,
                "height": 114,
                "params": "url = https://api.domain.com;\nuser = apiUser;\npassword = apiPassword;\n",
                "out": "",
                "code": "// block code\nfunction main(out) {\n  // some init code\n  this.context.user = this.params.user;\n  return out;\n}"
            },
            {
                "id": "Check mail",
                "component": "block",
                "title": "Check orders",
                "x": 439,
                "y": 205.58,
                "width": 166.18,
                "height": 50,
                "params": "",
                "out": "yes, no",
                "code": "// block code\nfunction main(outYes, outNo) {\n  // some code\n  if (this.context.user) {\n    return outYes;\n  } else {\n    return outNo;\n  }\n}"
            },
            {
                "id": "block3",
                "component": "block",
                "title": "Send confirmation email",
                "x": 361.86,
                "y": 297.64,
                "width": 190,
                "height": 60,
                "params": "",
                "out": "ok, error",
                "code": "// block code\nfunction main(out) {\n  \n}"
            },
            {
                "id": "Delay",
                "component": "block",
                "title": "Delay",
                "x": 355.83,
                "y": 531.59,
                "width": 108.17,
                "height": 62.41,
                "params": "sleep=200ms;",
                "out": "",
                "code": "// block code\nfunction main(callback) {\n  // here is a code for delay prototype:\n  // endTask is a special function for async return control\n  setTimeout(() => endTask(callback), this.params.sleep)\n}"
            },
            {
                "id": "block4",
                "component": "block",
                "title": "Log error",
                "x": 425,
                "y": 404,
                "width": 208,
                "height": 65,
                "params": "email=support@domain.com",
                "out": "",
                "code": "// block code"
            }
        ],
        "links": [
            {
                "id": "link1",
                "component": "link",
                "source": "start",
                "sourceOutIndex": 0,
                "destination": "Check mail",
                "path": []
            },
            {
                "id": "link5",
                "component": "link",
                "source": "Check mail",
                "sourceOutIndex": 1,
                "destination": "Check mail",
                "path": [
                    [
                        663.7589721679688,
                        274.47723388671875
                    ],
                    [
                        663.7589721679688,
                        181.434326171875
                    ]
                ]
            },
            {
                "id": "link6",
                "component": "link",
                "source": "Check mail",
                "sourceOutIndex": 0,
                "destination": "block3",
                "path": []
            },
            {
                "id": "link7",
                "component": "link",
                "source": "block3",
                "sourceOutIndex": 0,
                "destination": "Delay",
                "path": []
            },
            {
                "id": "link8",
                "component": "link",
                "source": "Delay",
                "sourceOutIndex": 0,
                "destination": "Check mail",
                "path": [
                    [
                        459,
                        623
                    ],
                    [
                        684,
                        594
                    ],
                    [
                        714,
                        335
                    ],
                    [
                        692,
                        156
                    ]
                ]
            },
            {
                "id": "link9",
                "component": "link",
                "source": "block3",
                "sourceOutIndex": 1,
                "destination": "block4",
                "path": []
            },
            {
                "id": "link10",
                "component": "link",
                "source": "block4",
                "sourceOutIndex": 0,
                "destination": "Delay",
                "path": []
            }
        ]
    };

module.exports.run = function (svgParentNode) {

    /*
    var diagramData = {component: 'diagram', id: 'diagram1'};
    var diagramViewModel = components.ViewModelFactory('diagram');
    var diagramView = components.ViewFactory(diagramViewModel, svgParentNode);
    diagramViewModel.load(diagramData);
    */

    var diagramData = data;
    var diagramViewModel = components.ViewModelFactory('diagram');
    var diagramView = components.ViewFactory(diagramViewModel, svgParentNode);
    diagramViewModel.load(diagramData);

    return diagramViewModel;
};

