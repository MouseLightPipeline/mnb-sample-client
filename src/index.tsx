import * as React from "react";
import * as ReactDOM from "react-dom";
import {Router, Route, browserHistory} from "react-router";

import 'react-select/dist/react-select.css';
import "react-virtualized/styles.css"
import "react-virtualized-select/styles.css"
import 'react-datepicker/dist/react-datepicker.css';

import {App} from "./components/App";

const rootEl = document.getElementById("root");

ReactDOM.render(
    <Router history={browserHistory}>
        <Route path="/" component={App}/>
    </Router>, rootEl
);
