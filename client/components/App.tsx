import * as React from "react";
import {NavLink, Route, Switch} from "react-router-dom";
import {Menu, Image, Message, Label, Icon, Segment} from "semantic-ui-react";
import {ToastContainer, ToastPosition} from "react-toastify";

import {Content} from "./Content";

import {SYSTEM_MESSAGE_QUERY, SystemMessageQuery} from "../graphql/systemMessage";
import {APP_QUERY, AppQuery} from "../graphql/app";
import {IBrainArea} from "../models/brainArea";
import {Samples} from "./samples/Samples";
import {Neurons} from "./neurons/Neurons";
import {Compartments} from "./compartments/Compartments";

const logo = require("file-loader!../../assets/mouseLight_nb_color.svg");

const toastStyleOverride = {
    minWidth: "600px",
    marginBottom: "40px"
};

const Heading = () => (
    <Menu inverted fluid stackable fixed="top">
        <Menu.Item as={NavLink} exact to="/" name="/" key="/">
            <Image size="small" src={logo}/>
        </Menu.Item>
        <Menu.Item as={NavLink} exact to="/samples" name="samples" key="samples">Samples</Menu.Item>
        <Menu.Item as={NavLink} exact to="/neurons" name="neurons" key="neurons">Neurons</Menu.Item>
        <Menu.Item as={NavLink} exact to="/compartments" name="compartments" key="compartments">Compartments</Menu.Item>
        <Menu.Item position="right">
            <SystemMessageQuery query={SYSTEM_MESSAGE_QUERY} pollInterval={5000}>
                {({loading, error, data}) => {
                    if (loading || error) {
                        return null;
                    }

                    if (data.systemMessage) {
                        return (<Label icon="mail" content={data.systemMessage}/>);
                    }

                    return null;
                }}
            </SystemMessageQuery>
        </Menu.Item>
    </Menu>
);

const Footer = () => (
    <Segment size="small" attached="bottom" inverted>
        Mouse Light Neuron Browser Copyright © 2016 - {(new Date().getFullYear())} Howard Hughes Medical Institute
    </Segment>
);

interface IAppState {
    isSettingsOpen?: boolean;
}

export class App extends React.Component<{}, IAppState> {
    public constructor(props: {}) {
        super(props);

        this.state = {
            isSettingsOpen: false,
        }
    }

    public render() {
        return (
            <div>
                <ToastContainer autoClose={6000} position={"bottom-center" as ToastPosition}
                                style={toastStyleOverride}/>
                <Heading/>
                <div style={{marginTop: "62px", padding: "20px"}}>
                    <AppQuery query={APP_QUERY} pollInterval={30000}>
                        {({loading, error, data}) => {
                           if (loading) {
                                return (
                                    <Message icon>
                                        <Icon name="circle notched" loading/>
                                        <Message.Content>
                                            <Message.Header content="Requesting content"/>
                                            We are retrieving basic system data.
                                        </Message.Content>
                                    </Message>
                                );
                            }

                            if (error) {
                                return (
                                    <Message negative icon="exclamation triangle" header="Service not responding"
                                             content="System data could not be loaded.  Will attempt again shortly."/>
                                );
                            }

                            makeBrainAreaMap(data.brainAreas);

                            return (
                                <Switch>
                                    <Route path="/" exact render={() => (<Content samples={data.samples.items}/>)}/>
                                    <Route path="/samples" render={() => (<Samples samples={data.samples.items}/>)}/>
                                    <Route path="/neurons" render={() => (<Neurons/>)}/>
                                    <Route path="/compartments"
                                           render={() => (<Compartments compartments={data.brainAreas}/>)}/>
                                </Switch>
                            );
                        }}
                    </AppQuery>
                </div>
                <Footer/>
            </div>
        );
    }
}


// Need a map of id -> area for fast lookup.  The current Select control does not make it easy/possible to carry the
// actual BrainArea object around with the select.  See filterOption function for brain area Select control, primarily.
const BrainAreaMap = new Map<string, IBrainArea>();

export let BrainAreas: IBrainArea[] = [];

function makeBrainAreaMap(brainAreas: IBrainArea[]): boolean {
    if (BrainAreaMap.size > 0) {
        // Polled and updated
        return true;
    }

    BrainAreas = brainAreas.slice().sort((a, b) => {
        if (a.depth == b.depth) {
            return a.name.localeCompare(b.name);
        }

        return a.depth - b.depth;
    });

    brainAreas.map(b => BrainAreaMap.set(b.id, b));

    return true;
}

export function lookupBrainArea(id: string): IBrainArea {
    return BrainAreaMap.get(id);
}
