import * as path from "path";

const express = require("express");
const proxy = require("express-http-proxy");
const passport = require("passport");
const DigestStrategy = require("passport-http").DigestStrategy;

const debug = require("debug")("mnb:sample-client:app");

import {Configuration} from "./configuration";

passport.use(new DigestStrategy({qop: 'auth'},
    function (username: any, done: any) {
        if (username === "mouselight") {
            return done(null, {id: 1, name: username}, "MostlyCloudy");
        } else {
            return done("Invalid user", null);
        }
    },
    function (params: any, done: any) {
        // validate nonce as necessary
        done(null, true)
    }
));

passport.serializeUser(function (user: any, done: any) {
    done(null, user.id);
});

passport.deserializeUser(function (id: any, done: any) {
    done(null, {id: 1, name: "mouselight"});
});

const apiUri = `http://${Configuration.graphQLHostname}:${Configuration.graphQLPort}`;
debug(`proxy GraphQL calls to ${apiUri}`);

let app = null;

if (process.env.NODE_ENV !== "production") {
    app = devServer();
} else {
    debug("configuring production express server");

    const rootPath = path.resolve(path.join(__dirname, "public"));

    app = express();

    app.use(passport.initialize());

    app.get("/", passport.authenticate('digest', {session: false}), (request: any, response: any, next: any) => {
        next();
    });

    app.post("/graphql", proxy(apiUri + "/graphql"));

    app.use(express.static(rootPath));

    app.use("/", (req: any, res: any) => {
        res.sendFile(path.join(rootPath, "index.html"));
    });
}

function devServer() {
    debug("configuring webpack dev server");
    const webpackConfig = require("../webpack.dev.config.js");
    const Webpack = require("webpack");
    const webpackDevServer = require("webpack-dev-server");
    const compiler = Webpack(webpackConfig);

    return new webpackDevServer(compiler, {
        stats: {
            colors: true
        },
        proxy: {
            "/graphql": {
                target: apiUri
            }
        },
        contentBase: path.resolve(path.join(__dirname, "..", "public")),
        disableHostCheck: true,
        publicPath: webpackConfig.output.publicPath,
        historyApiFallback: true,
        noInfo: false,
        quiet: false
    });
}

app.listen(Configuration.port, "0.0.0.0", () => {
    if (process.env.NODE_ENV !== "production") {
        debug(`Listening at http://localhost:${Configuration.port}/`);
    } else {
        debug(`Listening on port ${Configuration.port}`);
    }
});

/*
const compiler = Webpack(webpackConfig);

const server = new WebpackDevServer(compiler, {
    stats: {
        colors: true
    },
    proxy: {
        "/graphql": {
            target: `http://${Configuration.graphQLHostname}:${Configuration.graphQLPort}`
        }
    },
    setup: (app: any) => {
        app.use(passport.initialize());

        app.get("/", passport.authenticate('digest', {session: false}), (request: any, response: any, next: any) => {
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

server.listen(Configuration.port, "0.0.0.0", () =>{
    debug(`Starting sample client server on http://localhost:${Configuration.port}`);
});
*/
