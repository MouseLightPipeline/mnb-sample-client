"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_apollo_1 = require("react-apollo");
const apollo_client_1 = require("apollo-client");
const react_bootstrap_1 = require("react-bootstrap");
const react_toastify_1 = require("react-toastify");
require("react-toastify/dist/ReactToastify.min.css");
require("rc-slider/assets/index.css");
const Content_1 = require("./Content");
const networkInterface = apollo_client_1.createNetworkInterface({
    uri: "/graphql"
});
const client = new apollo_client_1.default({
    networkInterface: networkInterface,
    addTypename: true,
    dataIdFromObject: (result) => {
        if (result.id) {
            return result.__typename + result.id;
        }
        return null;
    },
    initialState: window.__APOLLO_STATE__,
    connectToDevTools: true
});
class Heading extends React.Component {
    render() {
        return (React.createElement(react_bootstrap_1.Navbar, { fluid: true, fixedTop: true, style: { marginBottom: 0 } },
            React.createElement(react_bootstrap_1.Navbar.Header, null,
                React.createElement(react_bootstrap_1.Navbar.Brand, null, "Mouse Light Sample Manager")),
            React.createElement(react_bootstrap_1.Navbar.Collapse, null,
                React.createElement(react_bootstrap_1.Nav, { pullRight: true },
                    React.createElement(react_bootstrap_1.NavItem, { onSelect: () => this.props.onSettingsClick() },
                        React.createElement(react_bootstrap_1.Glyphicon, { glyph: "cog" }))))));
    }
}
const Footer = () => (React.createElement("div", { className: "container-fluid footer" }, "Mouse Light Neuron Data Browser Copyright \u00A9 2016 - 2017 Howard Hughes Medical Institute"));
const toastStyleOverride = {
    minWidth: "600px",
    marginBottom: "40px"
};
class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isSettingsOpen: false
        };
    }
    onSettingsClick() {
        this.setState({ isSettingsOpen: true }, null);
    }
    onSettingsClose() {
        this.setState({ isSettingsOpen: false }, null);
    }
    render() {
        return (React.createElement(react_apollo_1.ApolloProvider, { client: client },
            React.createElement("div", null,
                React.createElement(react_toastify_1.ToastContainer, { autoClose: 6000, position: "bottom-center", style: toastStyleOverride }),
                React.createElement(Heading, { onSettingsClick: () => this.onSettingsClick() }),
                React.createElement(Content_1.Content, { isSettingsOpen: this.state.isSettingsOpen, onSettingsClose: () => this.onSettingsClose() }),
                React.createElement(Footer, null))));
    }
}
exports.App = App;
//# sourceMappingURL=App.js.map