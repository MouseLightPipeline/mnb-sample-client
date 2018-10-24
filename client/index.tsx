import * as React from "react";
import * as ReactDOM from "react-dom";
import {Router, Route, browserHistory, IndexRoute} from "react-router";

import {ApolloApp} from "./components/ApolloApp";
import {Samples} from "./components/Samples";
import {Neurons} from "./components/Neurons";
import {Content} from "./components/Content";
import {Compartments} from "./components/Compartments";

require("file-loader?name=index.html!../index.html");

import "react-select/dist/react-select.css";
import "react-virtualized/styles.css"
import "react-virtualized-select/styles.css"
import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.min.css";
import "rc-slider/assets/index.css";

import "../assets/mouselight.bootstrap.css";
import "../assets/style.css";

const rootEl = document.getElementById("root");

ReactDOM.render(
    <Router history={browserHistory}>
        <Route path="/" component={ApolloApp}>
            <IndexRoute component={Content}/>
            <Route path="/samples" component={Samples}/>
            <Route path="/neurons" component={Neurons}/>
            <Route path="/compartments" component={Compartments}/>
        </Route>
    </Router>, rootEl
);
