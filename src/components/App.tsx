import * as React from "react";
import {Navbar, Nav, Glyphicon, NavItem, Modal, Button, Badge} from "react-bootstrap";
import {ToastContainer} from "react-toastify";
import {Link} from "react-router";
import {graphql, InjectedGraphQLProps} from 'react-apollo';

import {IBrainArea} from "../models/brainArea";
import {ImmutableQuery} from "../graphql/immutableTypes";
import {isNullOrUndefined} from "util";
import {SystemMessageQuery} from "../graphql/systemMessage";
import {ReactElement} from "react";

const logoImage = require("file-loader!../../public/mouseLight_logo_web_white.png");

const linkStyle = {
    color: "white"
};

const toastStyleOverride = {
    minWidth: "600px",
    marginBottom: "40px"
};

interface ISystemMessageQuery {
    systemMessage: string;
}

interface IHeadingProps extends InjectedGraphQLProps<ISystemMessageQuery> {
    onSettingsClick(): void;
}

interface IHeadingState {
}

@graphql(SystemMessageQuery, {
    options: {
        pollInterval: 5000
    }
})
class Heading extends React.Component<IHeadingProps, IHeadingState> {
    public render() {
        return (
            <Navbar fluid fixedTop style={{marginBottom: 0}}>
                <Navbar.Header>
                    <Navbar.Brand>
                        <Link to="/">
                            <img src={logoImage}/>
                        </Link>
                    </Navbar.Brand>
                </Navbar.Header>
                <Navbar.Text><Link to="/samples" style={linkStyle}>Samples</Link></Navbar.Text>
                <Navbar.Text><Link to="/neurons" style={linkStyle}>Neurons</Link></Navbar.Text>
                <Navbar.Text><Link to="/compartments" style={linkStyle}>Compartments</Link></Navbar.Text>
                <Navbar.Collapse>
                    <Nav pullRight style={{marginRight: "15px"}}>
                        <NavItem onSelect={() => this.props.onSettingsClick()}>
                            <Glyphicon glyph="cog"/>
                        </NavItem>
                    </Nav>
                    <Navbar.Text pullRight><Badge>{this.props.data.systemMessage}</Badge></Navbar.Text>
                </Navbar.Collapse>
            </Navbar>);
    }
}

const Footer = () => (
    <div className="footer">
        <span>Mouse Light Neuron Data Browser Copyright © 2016 - 2017 Howard Hughes Medical Institute</span>
    </div>
);

interface IAppDataProps {
    brainAreas: IBrainArea[];
}

interface IAppProps extends InjectedGraphQLProps<IAppDataProps> {
}

interface IAppState {
    isSettingsOpen?: boolean;
    shouldClearCreateContentsAfterUpload?: boolean;
    haveLoadedBrainAreas?: boolean;
}

@graphql(ImmutableQuery, {
    options: {}
})
export class App extends React.Component<IAppProps, IAppState> {
    public constructor(props: IAppProps) {
        super(props);

        let shouldClearCreateContentsAfterUpload = true;

        if (typeof(Storage) !== "undefined") {
            shouldClearCreateContentsAfterUpload = localStorage.getItem("shouldClearCreateContentsAfterUpload") == "true";
        }

        let haveLoadedBrainAreas = false;

        if (props.data && !props.data.loading) {
            haveLoadedBrainAreas = makeBrainAreaMap(props.data.brainAreas);
        }

        this.state = {
            isSettingsOpen: false,
            shouldClearCreateContentsAfterUpload,
            haveLoadedBrainAreas
        }
    }

    public componentWillReceiveProps(nextProps: IAppProps) {
        if (nextProps.data && !nextProps.data.loading) {
            let haveLoadedBrainAreas = makeBrainAreaMap(nextProps.data.brainAreas);

            if (haveLoadedBrainAreas !== this.state.haveLoadedBrainAreas) {
                this.setState({haveLoadedBrainAreas});
            }
        }
    }

    private onSettingsClick() {
        this.setState({isSettingsOpen: true});
    }

    private onSettingsClose() {
        this.setState({isSettingsOpen: false});
    }

    private onChangeClearContents(shouldClear: boolean) {
        this.setState({shouldClearCreateContentsAfterUpload: shouldClear});

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
                <div style={{marginTop: "50px", marginBottom: "40px"}}>
                    {React.cloneElement(this.props.children as ReactElement<any>, { haveLoadedBrainAreas: this.state.haveLoadedBrainAreas })}
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

// Need a map of id -> area for fast lookup.  The current Select control does not make it easy/possible to carry the
// actual BrainArea object around with the select.  See filterOption function for brain area Select control, primarily.
const BrainAreaMap = new Map<string, IBrainArea>();

export let BrainAreas: IBrainArea[] = [];

function makeBrainAreaMap(brainAreas: IBrainArea[]): boolean {
    if (BrainAreaMap.size > 0 || isNullOrUndefined(brainAreas)) {
        return BrainAreaMap.size > 0;
    }

    BrainAreas = brainAreas;

    brainAreas.map(b => BrainAreaMap.set(b.id, b));

    return true;
}

export function lookupBrainArea(id: string): IBrainArea {
    return BrainAreaMap.get(id);
}
