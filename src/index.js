"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const ReactDOM = require("react-dom");
const react_router_1 = require("react-router");
require("react-select/dist/react-select.css");
require("react-virtualized/styles.css");
require("react-virtualized-select/styles.css");
require("react-datepicker/dist/react-datepicker.css");
const App_1 = require("./components/App");
const rootEl = document.getElementById("root");
ReactDOM.render(React.createElement(react_router_1.Router, { history: react_router_1.browserHistory },
    React.createElement(react_router_1.Route, { path: "/", component: App_1.App })), rootEl);
//# sourceMappingURL=index.js.map