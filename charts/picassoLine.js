define(['../node_modules/picasso.js/dist/picasso', '../node_modules/picasso-plugin-q/dist/picasso-q', '../components/picassoTooltip'], function (picasso, picassoQ, tooltip) {

    return {
        setupLine: setupLine
    };

    function setupLine(config, visualization, appView) {

        visualization.picassoLine = {
            renderChart: renderChart
        };


        function renderChart() {

            picasso.use(picassoQ); //PAM-18.02.2018: register q plugin    
            tooltip.setupTooltip(config, visualization);
            visualization.picassoTooltip.render();

            var line = function (scale, ref, stroke) {
                return {
                    type: 'line',
                    data: {
                        collection: 'lines'
                    },
                    settings: {
                        coordinates: {
                            major: { scale: 't' },
                            minor: { scale, ref }
                        },
                        layers: {
                            curve: visualization.properties.chartMethodLine,
                            line: {
                                stroke
                            }
                        }
                    }
                };
            }

            var point = function (scale, ref, fill, minFill, maxFill) {
                return {
                    type: "point",
                    data: {
                        collection: "points"
                    },

                    brush: {
                        trigger: [{
                            contexts: ['selection']
                        }],
                        consume: [{
                            context: 'selection',
                            style: {
                                inactive: {
                                    opacity: 0.4
                                }
                            }
                        }]
                    },
                    settings: {
                        x: { scale: "t" },
                        y: { scale, ref },
                        fill: {
                            scale: "y",
                            fn: d => {
                                return fill;
                            }
                        },
                        size: visualization.properties.chartTickPoints ? 0.2 : 0
                    }
                };
            }

            var picassoContainer = document.querySelector("#" + visualization.properties.rootDivId);

            var line = picasso.chart({
                element: picassoContainer,
                data: [{
                    type: 'q',
                    data: visualization.state.data
                }],
                settings: {
                    interactions: [{
                        type: 'native',
                        events: {
                            mousemove: function (e) {
                                if (visualization.properties.chartShowTooltip) {
                                    this.chart.component('tooltip').emit('hover', e);
                                }
                            }
                        }
                    }],
                    collections: [
                        {
                            key: 'points',
                            type: 'point',
                            data: {
                                extract: {
                                    field: visualization.state.data.dim.Name,
                                    filter: visualization.properties.chartTickPoints ? d => d.qAttrExps.qValues[config.DIMENSION_INDEX_FILTER].qNum == 1 : false,
                                    props: {
                                        s: { field: visualization.state.data.measure.Name }
                                    },

                                }
                            }
                        },
                        {
                            key: 'lines',
                            type: 'line',
                            data: {
                                extract: {
                                    field: visualization.state.data.dim.Name,
                                    filter: d => d.qAttrExps.qValues[config.DIMENSION_INDEX_FILTER].qNum == 1,
                                    props: {
                                        s: { field: visualization.state.data.measure.Name }
                                    }
                                }
                            }
                        }
                    ],
                    scales: {
                        y: {
                            data: {
                                field: visualization.state.data.measure.Name
                            },
                            invert: true,
                            expand: 0.2
                        },
                        t: {
                            data: {
                                extract: {
                                    field: visualization.state.data.dim.Name,
                                    filter: d => d.qAttrExps.qValues[config.DIMENSION_INDEX_FILTER].qNum == 1
                                }
                            }
                        }
                    },
                    components: [{
                        key: 'tooltip',
                        type: 'tooltip',
                        background: 'white'
                    },
                        {
                            type: 'axis',
                            dock: 'left',
                            scale: 'y',
                            formatter: {
                                type: 'd3-number',
                                format: visualization.properties.chartNumberFormat
                            }
                        }, {
                            type: 'axis',
                            dock: 'bottom',
                            scale: 't',
                        },
                        point('y', 's', visualization.properties.chartPointColor, visualization.properties.chartPointColor, visualization.properties.chartPointColor),
                        line('y', 's', visualization.properties.chartLineColor)
                    ]
                }
            });

            line.brush('selection').on('update', function () {
                var selection = picassoQ.selections(line.brush('selection'))[0];
                console.log(selection);
                appView.selectValues(selection.params[1], selection.params[2], selection.params[3]);                
            });

            return line;
        }
    }
});



