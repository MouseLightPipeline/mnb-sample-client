import * as React from "react";
import * as ReactDOM from "react-dom";
import {Router, Route, browserHistory, IndexRoute} from "react-router";

import "ndb-react-components/styles/mouselight.bootstrap.css";
import "ndb-react-components/styles/style.css";

import {ApolloApp} from "./components/ApolloApp";
import {Samples} from "./components/Samples";
import {Neurons} from "./components/Neurons";
import {Content} from "./components/Content";

const rootEl = document.getElementById("root");

ReactDOM.render(
    <Router history={browserHistory}>
        <Route path="/" component={ApolloApp}>
            <IndexRoute component={Content}/>
            <Route path="/samples" component={Samples}/>
            <Route path="/neurons" component={Neurons}/>
        </Route>
    </Router>, rootEl
);
