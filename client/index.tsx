import * as React from "react";
import * as ReactDOM from "react-dom";
import {BrowserRouter} from "react-router-dom";

import {ApolloApp} from "./components/ApolloApp";

require("file-loader?name=index.html!../index.html");

import "react-table/react-table.css"
import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.min.css";
import "rc-slider/assets/index.css";
import "../assets/style.css";

const rootEl = document.getElementById("root");

ReactDOM.render(
    <BrowserRouter>
        <ApolloApp/>
    </BrowserRouter>, rootEl
);
