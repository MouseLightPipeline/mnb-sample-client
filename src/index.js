"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const ReactDOM = require("react-dom");
const react_router_1 = require("react-router");
const ApolloApp_1 = require("./components/ApolloApp");
const Samples_1 = require("./components/Samples");
const Neurons_1 = require("./components/Neurons");
const Content_1 = require("./components/Content");
require("react-select/dist/react-select.css");
require("react-virtualized/styles.css");
require("react-virtualized-select/styles.css");
require("react-datepicker/dist/react-datepicker.css");
require("react-toastify/dist/ReactToastify.min.css");
require("rc-slider/assets/index.css");
require("./util/style.css");
const rootEl = document.getElementById("root");
ReactDOM.render(React.createElement(react_router_1.Router, { history: react_router_1.browserHistory },
    React.createElement(react_router_1.Route, { path: "/", component: ApolloApp_1.ApolloApp },
        React.createElement(react_router_1.IndexRoute, { component: Content_1.Content }),
        React.createElement(react_router_1.Route, { path: "/samples", component: Samples_1.Samples }),
        React.createElement(react_router_1.Route, { path: "/neurons", component: Neurons_1.Neurons }))), rootEl);
//# sourceMappingURL=index.js.map