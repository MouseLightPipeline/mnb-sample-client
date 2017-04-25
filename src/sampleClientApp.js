"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const webpackConfig = require("./../webpack.config.js");
const debug = require("debug")("ndb:sample-client:app");
const configuration_1 = require("./configuration");
const compiler = Webpack(webpackConfig);
const server = new WebpackDevServer(compiler, {
    stats: {
        colors: true
    },
    proxy: {
        "/graphql": {
            target: `http://${configuration_1.Configuration.graphQLHostname}:${configuration_1.Configuration.graphQLPort}`
        }
    },
    publicPath: webpackConfig.output.publicPath,
    hot: true,
    historyApiFallback: true,
    noInfo: false,
    quiet: false
});
server.listen(configuration_1.Configuration.port, "0.0.0.0", () => {
    debug(`Starting sample client server on http://localhost:${configuration_1.Configuration.port}`);
});
//# sourceMappingURL=sampleClientApp.js.map