define(['../node_modules/picasso.js/dist/picasso'], function (picasso) {

    return {
        setupTooltip: setupTooltip
    };

    function setupTooltip(config, visualization) {

        visualization.picassoTooltip = {
            render: render
        };


        function render() {

            function getFieldLabel(field, data) {

                var label;
                var res = field.split("/");

                var fieldName = res[0];
                var fieldIndex = res[1];

                switch (fieldName) {
                    case "qDimensionInfo":
                        label = data.qDimensionInfo[fieldIndex].qFallbackTitle;
                        break;
                    case "qMeasureInfo":
                        label = data.qMeasureInfo[fieldIndex].qFallbackTitle;
                        break;
                    default:
                        label = field;
                }

                return label;
            }

            var tooltip = picasso.component('tooltip', {

                //PAM: The require property allows us to pull in our dependencies, in this case the chart instance for shape lookups and the renderer for rendering our nodes.
                require: ['chart', 'renderer'],

                //PAM: A component can define a set of default properties that expose in the current context. In our case we'll just allow some simple style related properties to be set by the users.
                defaultSettings: {
                    background: '#f9f9f9',
                    fontSize: '12px'
                },

                //PAM: We require a particular type of renderer, the available once are svg/canvas/dom. Since we want to do be able do CSS layouting we'll use the dom-renderer. It's available in the context as `renderer`.
                renderer: 'dom',

                //PAM: By defining a `on` property we're able to bind custom events to the component.
                on: {

                    //PAM: From the chart instance we'll be able to emit a the `hover` event.
                    hover(e) {

                        const b = this.chart.element.getBoundingClientRect();
                        this.state.nodes = this.chart.shapesAt({
                            x: e.clientX - b.left,
                            y: e.clientY - b.top
                        });
                        this.renderer.render(this.buildNodes())
                    }
                },
                created() {
                    this.state = { nodes: [] };
                },
                buildRow(d) {

                    var fieldName = getFieldLabel(d.source.field, visualization.state.data);

                    return [
                        this.h('div',
                            {
                                style: {
                                    "margin-right": "4px",
                                    "font-weight": 600
                                }
                            },
                            `${fieldName}: `),
                        this.h('div',
                            {},
                            `${d.label}`)
                    ];
                },
                buildNodes() {

                    //PAM Filter out any node that doesn't have any data bound to it or is a container node.
                    const shapes = this.state.nodes;//filter(n => n.type !== 'container' && n.data);
                    if (!shapes.length) {
                        return [];
                    }

                    //PAM Find an appropriate place to position the tooltip, lower right corner is good enough for now.
                    const targetNode = shapes[shapes.length - 1];
                    const left = targetNode.bounds.x + targetNode.bounds.width;
                    const top = targetNode.bounds.y + Math.floor((targetNode.bounds.height / 2));

                    //PAM Render each data property should be rendered on a separate row.
                    const rows = Object.keys(targetNode.data).filter(prop => prop !== 'value' && prop !== 'label' && prop !== 'start').map(dataProp => {

                        return this.h('div',
                            {
                                style: {
                                    display: 'flex'
                                }
                            },
                            this.buildRow(dataProp !== 'source' ? targetNode.data[dataProp] : targetNode.data)
                        )
                    });

                    var maxZ = Math.max.apply(null,
                        $.map($('body *'), function (e, n) {
                            if ($(e).css('position') != 'static')
                                return parseInt($(e).css('z-index')) || 1;
                        })) + 1;

                    console.log(maxZ);

                    return [
                        this.h('div', {
                            style: {
                                "z-index": maxZ,
                                position: 'relative',
                                left: `${left}px`,
                                top: `${top}px`,
                                background: this.settings.background,
                                color: '#888',
                                display: 'inline-block',
                                "box-shadow": "0px 0px 5px 0px rgba(123, 123, 123, 0.5)",
                                "border-radius": "5px",
                                padding: '8px',
                                "font-size": this.settings.fontSize,
                                "font-family": 'Arial'
                            }
                        },
                            rows)
                    ];
                },

                // picasso.js uses snabbdom(https://github.com/snabbdom/snabbdom) for dom-manipulation and exposes the snabbdom helper function `h` as a parameter to the `render` function.
                // We'll use `h` to render our tooltip, but as we don't need it right here, we'll store it in the context for later use.
                render(h) {
                    this.h = h;
                    return []; // Nothing to render initially so we return an empty array.
                }
            });
        }
    }
});

