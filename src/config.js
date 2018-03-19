define(function () {
  var QLIK_MAX_DATA_PER_REQUEST = 10000;
  var QLIK_DIMENSION_COUNT = 1;
  var QLIK_DIMENSION_MAX = 1;
  var QLIK_DIMENSION_MIN = 1;
  var QLIK_MIN_MEASURE_COUNT = 1;
  var QLIK_MAX_MEASURE_COUNT = 6;
  var DATA_PER_ROW = QLIK_DIMENSION_COUNT + QLIK_MIN_MEASURE_COUNT;
  var ROWS_PER_PAGE = Math.floor(QLIK_MAX_DATA_PER_REQUEST / DATA_PER_ROW);

  var DIMENSION_INDEX_FILTER = 0;

  var methods = [ //interpolation methods
    'linear',
    'cardinal',
    'monotone'
  ];

  return {
    QLIK_MAX_DATA_PER_REQUEST: QLIK_MAX_DATA_PER_REQUEST,
    DATA_PER_ROW: DATA_PER_ROW,
    ROWS_PER_PAGE: ROWS_PER_PAGE,
    DIMENSION_INDEX_FILTER: DIMENSION_INDEX_FILTER,
    initialProperties: {
      version: 1.0,
      qHyperCubeDef: {
        qDimensions: [],
        qMeasures: [],
        qInitialDataFetch: [{
          qWidth: 10,
          qHeight: 1000 // needs a limitation
        }]
      },
      selectionMode: "CONFIRM"
    },
    support: {
      snapshot: true,
      export: true,
      exportData: true
    },
    definition: {
      type: 'items',
      component: 'accordion',
      items: {
        dim: {
          uses: 'dimensions',
          min: QLIK_DIMENSION_MIN,
          max: QLIK_DIMENSION_MAX,
          items: {
            filterDim: {
              type: "string",
              label: 'Filter By',
              ref: 'qAttributeExpressions.' + DIMENSION_INDEX_FILTER + '.qExpression',
              component: "expression",
              defaultValue: "0"
            }
          }
        },
        exp: {
          uses: 'measures',
          min: QLIK_MIN_MEASURE_COUNT,
          max: QLIK_MAX_MEASURE_COUNT
        },
        sorting: {
          uses: "sorting"
        },
        addons: {
          uses: "addons",
          items: {
            dataHandling: {
              uses: "dataHandling",
              items: {
                alternativeMessage: {
                  type: "string",
                  label: "Alternative Calc Condition Message",
                  expression: "optional",
                  defaultValue: "",
                  ref: "qDef.CalcCustomMessage"
                }
              }
            }
          }
        },
        settings: {
          uses: "settings",
          items: {
            options: {
              label: "Options",
              type: "items",
              items: {
                Chart: {
                  ref: "qDef.Chart",
                  label: "Picasso Chart",
                  defaultValue: "0",
                  type: "string",
                  component: "dropdown",
                  options: [
                  {
                      value: "0",
                      label: "Line Chart"
                    }
                  ]
                },
                ChartNumberFormat: {
                  ref: "qDef.ChartNumberFormat",
                  type: "string",
                  label: "Number Format (D3) on Y-Axis",
                  defaultValue: ".2",
                  expression: "optional"
                },   
                ChartColorLinePicker: {
                  label: "Line Color",
                  component: "color-picker",
                  ref: "qDef.ChartLineColor",
                  type: "object",
                  defaultValue: {
                    index: 3,
                    color: "#4477aa"
                  },
                  show: function (data) {
                    return data.qDef.Chart == "0";
                  }
                },
                ChartColorPointPicker: {
                  label: "Point Color",
                  component: "color-picker",
                  ref: "qDef.ChartPointColor",
                  type: "object",
                  defaultValue: {
                    index: 3,
                    color: "#4477aa"
                  },
                  show: function (data) {
                    return data.qDef.Chart == "0";
                  }
                },
                ChartLineMethod: {
                  type: "string",
                  component: "dropdown",
                  label: "Method",
                  ref: "qDef.ChartLineMethod",
                  defaultValue: "linear",
                  show: function (data) {
                    return data.qDef.Chart == "0";
                  },
                  options: function () {
                    return methods.map(function (item) {
                      return {
                        value: item.toLowerCase(),
                        label: item
                      };
                    });
                  }
                },
                ChartLinePoints: {
                  type: "boolean",
                  label: "Tick points",
                  ref: "qDef.ChartTickPoints",
                  defaultValue: true,
                  show: function (data) {
                    return data.qDef.Chart == "0";
                  }
                },
                ChartShowTooltip: {
                  type: "boolean",
                  label: "Show Tooltip",
                  ref: "qDef.ChartTooltip",
                  defaultValue: false
                }
              }
            }
          }
        }
      }
    },
    snapshot: {
      canTakeSnapshot: true
    }
  };
});
