# Qlik Picasso.js extension
This repository shows a Qliksense Extension based on the open source Picasso.js visualization library. The extension is already setup in the way that you can extend it by adding other picasso standard charts or by your own definition of chart. You can use the standard definitions which you can find on the picasso.js webbage https://picassojs.com/en/examples.html, which will take you to the https://beta.observablehq.com page where you can create your own interactive notebooks to test out all possible picasso charts.

The extension is already using some interesting capabilities like:
* Custom componentes (tooltip)
* Qlik Selection feature (using the q-plugin)
* Filtering capability on
- Here note that the "Filter by" property should return 1 for applying a valid filter to the hypercube rows. You can use Qlik Advanced Expression capability to filter the hypercube based on your condigion.
* Layout settings:
  - Picasso Chart  => Can be extended by extending the extension
  - Number Format Y-Axis
  - Line Color
  - Point Color
  - Line Method
  - Tick points
  - Show Tooltip

# Installation steps
Download this extension package as a ZIP and depeding on the environment:
* Extract it to your Qlik Sense Desktop extension folder
* Import it into the QMC in the Extension section on the Qliksense Server

Note:
The repository includes a demo app with a working example of the extension.

### Resources:
* https://picassojs.com
* https://github.com/qlik-oss/picasso.js


