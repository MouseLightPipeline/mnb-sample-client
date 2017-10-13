"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Webpack = require("webpack");
const passport = require("passport");
const DigestStrategy = require("passport-http").DigestStrategy;
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
    setup: (app) => {
        app.use(passport.initialize());
        app.get("/", passport.authenticate('digest', { session: false }), (request, response, next) => {
            next();
        });
    },
    disableHostCheck: true,
    publicPath: webpackConfig.output.publicPath,
    hot: true,
    historyApiFallback: true,
    noInfo: false,
    quiet: false
});
passport.use(new DigestStrategy({ qop: 'auth' }, function (username, done) {
    if (username === "mouselight") {
        return done(null, { id: 1, name: username }, "MostlyCloudy");
    }
    else {
        return done("Invalid user", null);
    }
}, function (params, done) {
    // validate nonces as necessary
    done(null, true);
}));
passport.serializeUser(function (user, done) {
    done(null, user.id);
});
passport.deserializeUser(function (id, done) {
    done(null, { id: 1, name: "mouselight" });
});
server.listen(configuration_1.Configuration.port, "0.0.0.0", () => {
    debug(`Starting sample client server on http://localhost:${configuration_1.Configuration.port}`);
});
//# sourceMappingURL=sampleClientApp.js.map