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
  "showCage": false,
  "elements": [
    {
      "id": "textbox1",
      "component": "textbox",
      "text": "You can:\n- add new Block (alt + click)\n- each block can contain code, that will be executed by engine\n- select multiple elements with shift\n- move selected with mouse or keyboard\n  (plus shift for accuracy)\n- delete selected (backspace, del)\n- resize selected with alt \n(plus shift for accuracy)\n- scale with mouse scroll or touch gestures\n- save and load diagram JSON",
      "x": 23.94,
      "y": 138.42,
      "width": 420,
      "height": 190
    },
    {
      "id": "start",
      "component": "block",
      "title": "Start",
      "x": 339,
      "y": 64,
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
      "x": 257.44,
      "y": 380.02,
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
      "x": 549,
      "y": 194,
      "width": 200,
      "height": 150,
      "params": "",
      "out": "ok, error",
      "code": "// block code\nfunction main(out) {\n  \n}"
    },
    {
      "id": "Delay",
      "component": "block",
      "title": "Delay component",
      "x": 561.62,
      "y": 445.16,
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
      "x": 60.98,
      "y": 424.57,
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
      "x": 192.52,
      "y": 621.15,
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
          502.0335693359375,
          455.9496765136719
        ],
        [
          503.0335693359375,
          356.9496765136719
        ]
      ]
    },
    {
      "id": "link6",
      "component": "link",
      "source": "Check mail",
      "sourceOutIndex": 0,
      "destination": "block3",
      "path": [
        [
          374.8887939453125,
          510.949951171875
        ],
        [
          527.8887939453125,
          499.949951171875
        ],
        [
          594.8887939453125,
          147.949951171875
        ]
      ]
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
          760,
          622
        ],
        [
          857,
          516
        ],
        [
          762,
          87
        ],
        [
          375,
          161
        ]
      ]
    },
    {
      "id": "link9",
      "component": "link",
      "source": "Check mail",
      "sourceOutIndex": 0,
      "destination": "block4",
      "path": [
        [
          205.84756469726562,
          432.8153991699219
        ],
        [
          184.54888916015625,
          357.0987548828125
        ],
        [
          113.37466430664062,
          370.31683349609375
        ]
      ]
    },
    {
      "id": "link10",
      "component": "link",
      "source": "block4",
      "sourceOutIndex": 0,
      "destination": "block5",
      "path": [
        [
          249.08668518066406,
          512.2546691894531
        ],
        [
          258.09527587890625,
          587.62158203125
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
          172.6640625,
          574.5994262695312
        ],
        [
          226.96434020996094,
          521.3047485351562
        ]
      ]
    },
    {
      "id": "link13",
      "component": "link",
      "source": "block4",
      "sourceOutIndex": 0,
      "destination": "block5",
      "path": [
        [
          115.34710693359375,
          552.4771118164062
        ],
        [
          202.83087921142578,
          564.5438842773438
        ]
      ]
    }
  ]
};

module.exports.run = function (svgParentNode) {
    //var diagramData = {component: 'diagram', id: 'diagram1'};

    //debug:
    //var diagramData = {component: 'diagram', id: 'diagram1', elements: [{component: 'textbox', id: 'textbox1', text: 'Some big welcome text.\nHello world!\n1\n2', x: 10, y: 10, width: 200, height: 100}]};
    var diagramData = data;

    var diagramViewModel = components.ViewModelFactory('diagram');
    diagramViewModel.load(diagramData);
    var diagramView = components.ViewFactory(diagramViewModel, svgParentNode);

    //debug initialize repaint:
    diagramViewModel.elements.valueHasMutated();
    diagramViewModel.links.valueHasMutated();
    //debug initialize selection:
    diagramViewModel.elements()[0].commandSelect();

    ko.applyBindings(diagramViewModel, $('#params')[0]); //! should be in another place ; consider: ko.applyBindings(diagramViewModel, paramsNode)
};

