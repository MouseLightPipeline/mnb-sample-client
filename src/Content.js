"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_bootstrap_1 = require("react-bootstrap");
class SettingsDialog extends React.Component {
    render() {
        return (React.createElement(react_bootstrap_1.Modal, { show: this.props.show, onHide: this.props.onHide, "aria-labelledby": "contained-modal-title-sm" },
            React.createElement(react_bootstrap_1.Modal.Header, { closeButton: true },
                React.createElement(react_bootstrap_1.Modal.Title, { id: "contained-modal-title-sm" }, "Settings")),
            React.createElement(react_bootstrap_1.Modal.Body, null, "There are no settings for this service."),
            React.createElement(react_bootstrap_1.Modal.Footer, null,
                React.createElement(react_bootstrap_1.Button, { bsSize: "small", onClick: this.props.onHide }, "Close"))));
    }
}
class Content extends React.Component {
    constructor(props) {
        super(props);
        let shouldClearCreateContentsAfterUpload = true;
        if (typeof (Storage) !== "undefined") {
            shouldClearCreateContentsAfterUpload = localStorage.getItem("shouldClearCreateContentsAfterUpload") == "true";
        }
        this.state = { shouldClearCreateContentsAfterUpload };
    }
    onChangeClearContents(shouldClear) {
        this.setState({ shouldClearCreateContentsAfterUpload: shouldClear }, null);
        if (typeof (Storage) !== "undefined") {
            localStorage.setItem("shouldClearCreateContentsAfterUpload", shouldClear ? "true" : "false");
        }
    }
    render() {
        return (React.createElement("div", { style: { marginTop: "45px", marginBottom: "40px" } },
            React.createElement(SettingsDialog, { show: this.props.isSettingsOpen, shouldClearCreateContentsAfterUpload: this.state.shouldClearCreateContentsAfterUpload, onHide: () => this.props.onSettingsClose(), onChangeClearContents: (b) => this.onChangeClearContents(b) })));
    }
}
exports.Content = Content;
//# sourceMappingURL=Content.js.map