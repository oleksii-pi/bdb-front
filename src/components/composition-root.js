var components = require('./components');
var ko = require('knockout');
require('./knockout-init');

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

var data =
    {
        "id": "diagram1",
        "component": "diagram",
        "maxThreadCount": 100,
        "showCage": true,
        "elements": [
            {
                "id": "textbox1",
                "component": "textbox",
                "text": "You can:\n- add new Block (alt + click)\n- each block can contain code, \nthat will be executed by engine\n- select multiple elements with shift\n- move selected with mouse or keyboard\n  (plus shift for accuracy)\n- delete selected (backspace, del)\n- resize selected with alt \n(plus shift for accuracy)\n- scale with mouse scroll or touch gestures\n- save and load diagram JSON",
                "x": 4.74,
                "y": 1.98,
                "width": 300,
                "height": 220
            },
            {
                "id": "start",
                "component": "block",
                "title": "Start",
                "x": 307.2,
                "y": 56.8,
                "width": 212,
                "height": 84,
                "params": "url = https://api.domain.com;\nuser = testUser;\n",
                "out": "",
                "code": "// block code\nfunction main(out) {\n  // some init code\n  this.context.user = this.params.user;\n  return out;\n}"
            },
            {
                "id": "Check mail",
                "component": "block",
                "title": "Check orders",
                "x": 273,
                "y": 205.58,
                "width": 276.18,
                "height": 50,
                "params": "",
                "out": "yes, no",
                "code": "// block code\nfunction main(outYes, outNo) {\n  // some code\n  if (this.context.user) {\n    return outYes;\n  } else {\n    return outNo;\n  }\n}"
            },
            {
                "id": "block3",
                "component": "block",
                "title": "Send email",
                "x": 306.86,
                "y": 330.64,
                "width": 200,
                "height": 60,
                "params": "",
                "out": "ok, error",
                "code": "// block code\nfunction main(out) {\n  \n}"
            },
            {
                "id": "Delay",
                "component": "block",
                "title": "Delay component",
                "x": 319.83,
                "y": 455.59,
                "width": 200,
                "height": 74,
                "params": "sleep=200ms;",
                "out": "",
                "code": "// block code\nfunction main(callback) {\n  // here is a code for delay prototype:\n  // endTask is a special function for async return control\n  setTimeout(() => endTask(callback), this.params.sleep)\n}"
            },
            {
                "id": "block4",
                "component": "block",
                "title": "block4",
                "x": 188.8,
                "y": 307.63,
                "width": 76.26,
                "height": 50,
                "params": "",
                "out": "",
                "code": "// block code"
            },
            {
                "id": "block5",
                "component": "block",
                "title": "block5",
                "x": 185.13,
                "y": 413.52,
                "width": 88.44,
                "height": 50,
                "params": "",
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
                        553.7589721679688,
                        274.47723388671875
                    ],
                    [
                        553.7589721679688,
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
                        494.3604431152344,
                        579.1610717773438
                    ],
                    [
                        599.4697875976562,
                        546.5919799804688
                    ],
                    [
                        617.2347412109375,
                        314.1671142578125
                    ],
                    [
                        580.5247802734375,
                        138.09927368164062
                    ]
                ]
            },
            {
                "id": "link9",
                "component": "link",
                "source": "Check mail",
                "sourceOutIndex": 0,
                "destination": "block4",
                "path": []
            },
            {
                "id": "link10",
                "component": "link",
                "source": "block4",
                "sourceOutIndex": 0,
                "destination": "block5",
                "path": [
                    [
                        251.08668518066406,
                        382.2546691894531
                    ]
                ]
            },
            {
                "id": "link11",
                "component": "link",
                "source": "block3",
                "sourceOutIndex": 1,
                "destination": "Delay",
                "path": []
            },
            {
                "id": "link12",
                "component": "link",
                "source": "block4",
                "sourceOutIndex": 0,
                "destination": "block5",
                "path": [
                    [
                        202.6640625,
                        384.59942626953125
                    ]
                ]
            },
            {
                "id": "link13",
                "component": "link",
                "source": "block4",
                "sourceOutIndex": 0,
                "destination": "block5",
                "path": []
            }
        ]
    };

module.exports.run = function (svgParentNode) {
    //var diagramData = {component: 'diagram', id: 'diagram1'};

    //debug:
    //var diagramData = {component: 'diagram', id: 'diagram1', elements: [{component: 'textbox', id: 'textbox1', text: 'Some big welcome text.\nHello world!\n1\n2', x: 10, y: 10, width: 200, height: 100}]};
    var diagramData = data;

    var diagramViewModel = components.ViewModelFactory('diagram');
    var diagramView = components.ViewFactory(diagramViewModel, svgParentNode);
    diagramViewModel.load(diagramData);

    //debug initialize selection:
    diagramViewModel.elements()[0].commandSelect();

    ko.applyBindings(diagramViewModel, $('#params')[0]); //! should be in another place ; consider: ko.applyBindings(diagramViewModel, paramsNode)
};

