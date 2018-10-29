import * as React from "react";
import * as ReactDOM from "react-dom";

import {ApolloApp} from "./components/ApolloApp";

require("file-loader?name=index.html!../index.html");

import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.min.css";
import "rc-slider/assets/index.css";

import "../assets/mouselight.bootstrap.css";
import "../assets/style.css";
import {BrowserRouter} from "react-router-dom";

const rootEl = document.getElementById("root");

ReactDOM.render(
    <BrowserRouter>
        <ApolloApp/>
    </BrowserRouter>, rootEl
);
