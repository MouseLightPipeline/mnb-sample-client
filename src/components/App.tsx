import * as React from "react";
import {Navbar, Nav, Glyphicon, NavItem, Modal, Button} from "react-bootstrap";
import {ToastContainer} from "react-toastify";
import {Link} from "react-router";

const linkStyle = {
    color: "white"
};

interface IHeadingProps {
    onSettingsClick(): void;
}

interface IHeadingState {
}

class Heading extends React.Component<IHeadingProps, IHeadingState> {
    public render() {
        return (
            <Navbar fluid fixedTop style={{marginBottom: 0}}>
                <Navbar.Header>
                    <Navbar.Brand>
                        <Link to="/">
                            Mouse Light
                        </Link>
                    </Navbar.Brand>
                </Navbar.Header>
                <Navbar.Collapse>
                        <Navbar.Text> <Link to="/samples" style={linkStyle}>Samples</Link></Navbar.Text>
                        <Navbar.Text> <Link to="/neurons" style={linkStyle}>Neurons</Link></Navbar.Text>
                    <Nav pullRight style={{marginRight: "15px"}}>
                        <NavItem onSelect={() => this.props.onSettingsClick()}>
                            <Glyphicon glyph="cog"/>
                        </NavItem>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>);
    }
}

const Footer = () => (
    <div className="footer">
        <span>Mouse Light Neuron Data Browser Copyright © 2016 - 2017 Howard Hughes Medical Institute</span>
    </div>
);

const toastStyleOverride = {

};

interface IAppProps {
}

interface IAppState {
    isSettingsOpen: boolean;
    shouldClearCreateContentsAfterUpload?: boolean;
}

export class App extends React.Component<IAppProps, IAppState> {
    public constructor(props: IAppProps) {
        super(props);


        let shouldClearCreateContentsAfterUpload = true;

        if (typeof(Storage) !== "undefined") {
            shouldClearCreateContentsAfterUpload = localStorage.getItem("shouldClearCreateContentsAfterUpload") == "true";
        }
        this.state = {
            isSettingsOpen: false,
            shouldClearCreateContentsAfterUpload
        }
    }

    private onSettingsClick() {
        this.setState({isSettingsOpen: true}, null);
    }

    private onSettingsClose() {
        this.setState({isSettingsOpen: false}, null);
    }

    private onChangeClearContents(shouldClear: boolean) {
        this.setState({shouldClearCreateContentsAfterUpload: shouldClear}, null);

        if (typeof(Storage) !== "undefined") {
            localStorage.setItem("shouldClearCreateContentsAfterUpload", shouldClear ? "true" : "false");
        }
    }

    public render() {
        return (
            <div>
                <ToastContainer autoClose={6000} position="bottom-center" style={toastStyleOverride}/>
                <SettingsDialog show={this.state.isSettingsOpen}
                                shouldClearCreateContentsAfterUpload={this.state.shouldClearCreateContentsAfterUpload}
                                onHide={() => this.onSettingsClose()}
                                onChangeClearContents={(b: boolean) => this.onChangeClearContents(b)}/>
                <Heading onSettingsClick={() => this.onSettingsClick()}/>
                <div style={{marginTop: "50px", marginBottom: "55px"}}>
                    {this.props.children}
                </div>
                <Footer/>
            </div>
        );
    }
}

interface ISettingsDialogProps {
    show: boolean
    shouldClearCreateContentsAfterUpload: boolean;

    onHide(): void;
    onChangeClearContents(shouldClear: boolean): void;
}

interface ISettingsDialogState {
}

class SettingsDialog extends React.Component<ISettingsDialogProps, ISettingsDialogState> {
    render() {
        return (
            <Modal show={this.props.show} onHide={this.props.onHide} aria-labelledby="contained-modal-title-sm">
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-sm">Settings</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    There are no settings for this service.
                </Modal.Body>
                <Modal.Footer>
                    <Button bsSize="small" onClick={this.props.onHide}>Close</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}
