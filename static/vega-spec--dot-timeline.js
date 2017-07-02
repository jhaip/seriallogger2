var vegaSpec__DotTimeline = {
  "$schema": "https://vega.github.io/schema/vega/v3.0.json",
  "width": 720,
  "height": 100,
  "padding": 5,

  "data": [
    {
      "name": "sp500",
      "values": [
        {"timestamp": "Jan 1 2000"},
        {"timestamp": "Feb 1 2000"},
        {"timestamp": "Mar 1 2000"},
        {"timestamp": "Apr 1 2000"}
      ],
      "format": {"type": "json", "parse": {"timestamp": "date"}}
    }
  ],

  "signals": [
    {
      "name": "detailDomain"
    },
    {
      "name": "width",
      "update": "720"
    },
    {
      "name": "height",
      "update": "20"
    },
    {
      "name": "brushoffset",
      "update": "0"
    }
  ],

  "marks": [
    {
      "type": "group",
      "name": "overview",
      "encode": {
        "enter": {
          "x": {"value": 0},
          "y": {"value": 0},
          "height": {"signal": "height"},
          "width": {"signal": "width"},
          "fill": {"value": "transparent"}
        }
      },
      "signals": [
        {
          "name": "brush", "value": 0,
          "on": [
            {
              "events": "@overview:mousedown",
              "update": "[x(), x()]"
            },
            {
              "events": "[@overview:mousedown, window:mouseup] > window:mousemove!",
              "update": "[brush[0], clamp(x(), 0, width)]"
            },
            {
              "events": {"signal": "delta"},
              "update": "clampRange([anchor[0] + delta, anchor[1] + delta], 0, width)"
            }
          ]
        },
        {
          "name": "anchor", "value": null,
          "on": [{"events": "@brush:mousedown", "update": "slice(brush)"}]
        },
        {
          "name": "xdown", "value": 0,
          "on": [{"events": "@brush:mousedown", "update": "x()"}]
        },
        {
          "name": "delta", "value": 0,
          "on": [
            {
              "events": "[@brush:mousedown, window:mouseup] > window:mousemove!",
              "update": "x() - xdown"
            }
          ]
        },
        {
          "name": "detailDomain",
          "push": "outer",
          "on": [
            {
              "events": {"signal": "brush"},
              "update": "span(brush) ? invert('xOverview', brush) : null"
            }
          ]
        }
      ],
      "scales": [
        {
          "name": "xOverview",
          "type": "time",
          "range": "width",
          "nice": "hour",
          "domain": {"data": "sp500", "field": "timestamp"}
        }
      ],
      "axes": [
        {"orient": "bottom", "scale": "xOverview"}
      ],
      "marks": [
        {
          "type": "symbol",
          "interactive": false,
          "from": {"data": "sp500"},
          "encode": {
            "update": {
              "x": {"scale": "xOverview", "field": "timestamp"},
              "y": {"signal": "height"},
              "size": {"value": 50},
              "fill": {"value": "steelblue"},
              "shape": {"value": "circle"}
            }
          }
        },
        {
          "type": "rect",
          "name": "brush",
          "encode": {
            "enter": {
              "y": {"signal": "brushoffset"},
              "height": {"signal": "height"},
              "fill": {"value": "#333"},
              "fillOpacity": {"value": 0.2}
            },
            "update": {
              "x": {"signal": "brush[0]"},
              "x2": {"signal": "brush[1]"}
            }
          }
        },
        {
          "type": "rect",
          "interactive": false,
          "encode": {
            "enter": {
              "y": {"signal": "brushoffset"},
              "height": {"signal": "height"},
              "width": {"value": 1},
              "fill": {"value": "firebrick"}
            },
            "update": {
              "x": {"signal": "brush[0]"}
            }
          }
        },
        {
          "type": "rect",
          "interactive": false,
          "encode": {
            "enter": {
              "y": {"signal": "brushoffset"},
              "height": {"signal": "height"},
              "width": {"value": 1},
              "fill": {"value": "firebrick"}
            },
            "update": {
              "x": {"signal": "brush[1]"}
            }
          }
        }
      ]
    }
  ]
};
