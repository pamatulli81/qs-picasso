var debug = false;

define(['qlik', 'qvangular', 'jquery', './config', 'text!./style.css', '../charts/picassoLine'],

    function (qlik, qv, $, config, style, picassoLine) {

        $('<style>').html(style).appendTo('head');

        var global = qlik.getGlobal(config);

        return {
            definition: config.definition,
            initialProperties: config.initialProperties,
            paint: main
        };

        function main($element, layout) {

            var visualizationThis = this;
            var scope = angular.element($element).scope();

            if (typeof layout.axeed === 'undefined') {
                var visualization = {};
            } else {
                var visualization = layout.axeed;
            }

            $element.empty();

            setupProperties($element, visualization, layout, layout.qInfo.qId);
            applyCustomCalcCondPatch(visualization);
            setupState(visualization, layout);
            render(visualization, visualizationThis, config, picassoLine);

            function applyCustomCalcCondPatch(visualization) {

                const backendApi = visualizationThis.backendApi;

                // Get custom message
                const alternativeCalcMessage = visualization.properties.calcCustomMessage;

                // getProperties
                const extensionProperties = backendApi.getProperties();

                extensionProperties.then(reply => {
                    // Compare current value in properties to value on layout
                    if (reply.qHyperCubeDef.customErrorMessage.calcCond !== alternativeCalcMessage) {
                        // if they don't match, patch the property
                        backendApi.applyPatches([{
                            "qPath": "/qHyperCubeDef/customErrorMessage/calcCond",
                            "qOp": "replace",
                            "qValue": '"' + alternativeCalcMessage + '"'
                        }], false);
                    }
                })
            }

            function render(visualization, visualizationThis, config, picassoLine) {

                switch (visualization.properties.chart) {
                    case "0":
                        var line = picassoLine.setupLine(config, visualization, visualizationThis);
                        visualization.picassoLine.renderChart();
                        break;
                    //PAM: Here you can handle more chart types....
                }
            }

            function setupProperties($element, visualization, layout, id) {

                var properties = visualization.properties;

                if (typeof properties === 'undefined') {
                    properties = visualization.properties = {};
                }

                properties.id = id;
                properties.rootDivId = 'viz_picasso_' + id;
                properties.chart = layout.qDef["Chart"];
                properties.chartShowTooltip = layout.qDef["ChartTooltip"];
                properties.chartNumberFormat = layout.qDef["ChartNumberFormat"];
                properties.calcCustomMessage = layout.qDef["CalcCustomMessage"];


                switch (properties.chart) {
                    case "0":
                        properties.chartPointColor = layout.qDef["ChartPointColor"].color;
                        properties.chartLineColor = layout.qDef["ChartLineColor"].color;
                        properties.chartTickPoints = layout.qDef["ChartTickPoints"];
                        properties.chartMethodLine = layout.qDef["ChartLineMethod"];
                        break
                }

                $element.html(
                    $('<div />')
                        .attr('id', properties.rootDivId)
                        .attr('class', properties.class)
                        .css("height", "100%")
                );
            }

            function setupState(visualization, layout) {

                var state = visualization.state;

                if (typeof state === 'undefined') {
                    state = visualization.state = {};
                }

                state.data = layout.qHyperCube;
                state.data.dim = addDim(config, layout.qHyperCube);
                state.data.measure = addMeasure(config, layout.qHyperCube);

            }
        }
    });

/*
 --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 PAM: Qlik Helper Function
 --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
*/

function getFieldLabel(field, hypercube) {

    var label;
    var res = field.split("/");

    var fieldName = res[0];
    var fieldIndex = res[1];

    switch (fieldName) {
        case "qDimensionInfo":
            label = hypercube.qDimensionInfo[fieldIndex].qFallbackTitle;
            break;
        case "qMeasureInfo":
            label = hypercube.qMeasureInfo[fieldIndex].qFallbackTitle;
            break;
        default:
            label = field;
    }

    return label;
}

function addDim(config, hypercube) {

    var dimNode = {};
    var dimensions = hypercube.qDimensionInfo;

    for (var i = 0; i <= dimensions.length - 1; i++) {

        var attr = dimensions[i].qAttrExprInfo;
        dimNode.Name = dimensions[i].qFallbackTitle;
        dimNode.Filter = attr[config.DIMENSION_INDEX_FILTER].qFallbackTitle;

    }

    return dimNode;
}

function addMeasure(config, hypercube) {

    var measureNode = {};
    var measures = hypercube.qMeasureInfo;

    for (var i = 0; i <= measures.length - 1; i++) {

        var attr = measures[i].qAttrExprInfo;
        measureNode.Name = measures[i].qFallbackTitle;

    }
    return measureNode;
}

/*
 --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 PAM: Helper Section
 --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
*/

function addOrRemove(array, value) {

    var index = array.indexOf(value);
    if (index === -1) {
        array.push(value);
    } else {
        array.splice(index, 1);
    }
}

function isInArray(value, array) {
    return array.indexOf(value) > -1;
}