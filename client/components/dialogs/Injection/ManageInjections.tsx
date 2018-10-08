import * as React from "react";
import {Modal, Button, Tabs, Tab,} from "react-bootstrap";
import {graphql, InjectedGraphQLProps} from 'react-apollo';
import {displaySample, ISample} from "../../../models/sample";
import {toast} from "react-toastify";

import {AddInjectionPanel} from "./AddInjectionPanel";
import {Fluorophores, InjectionViruses, SampleForInjectionQuery} from "../../../graphql/injection";
import {EditInjectionsPanel} from "./EditInjections";
import {GraphQLDataProps} from "react-apollo/lib/graphql";
import {IFluorophore} from "../../../models/fluorophore";
import {IInjectionVirus} from "../../../models/injectionVirus";

interface IInjectionVirusesQueryProps {
    injectionViruses: IInjectionVirus[];
}

interface IFluorophoresQueryProps {
    fluorophores: IFluorophore[];
}

interface IManageInjections {
    sample: ISample;
}

interface IManageInjectionsProps extends InjectedGraphQLProps<IManageInjections> {
    show: boolean;
    sampleId: string;

    injectionVirusesQuery?: IInjectionVirusesQueryProps & GraphQLDataProps;
    fluorophoresQuery?: IFluorophoresQueryProps & GraphQLDataProps;

    onClose(): void;
}

interface IManageInjectionsState {
    activeKey: any;
}

@graphql(InjectionViruses, {
    name: "injectionVirusesQuery",
    options: {
        pollInterval: 5000
    }
})
@graphql(Fluorophores, {
    name: "fluorophoresQuery",
    options: {
        pollInterval: 5000
    }
})
@graphql(SampleForInjectionQuery, {
    options: ({sampleId}) => ({
        pollInterval: 5000,
        variables: {
            id: sampleId
        }
    })
})
export class ManageInjections extends React.Component<IManageInjectionsProps, IManageInjectionsState> {
    public constructor(props: IManageInjectionsProps) {
        super(props);

        this.state = {
            activeKey: 1
        };
    }

    private onSelectTab(eventKey: any) {
        this.setState({activeKey: eventKey});
    }

    public render() {
        const sample = this.props.data && !this.props.data.loading ? this.props.data.sample : null;
        const viruses = this.props.injectionVirusesQuery && !this.props.injectionVirusesQuery.loading ? this.props.injectionVirusesQuery.injectionViruses : null;
        const fluorophores = this.props.fluorophoresQuery && !this.props.fluorophoresQuery.loading ? this.props.fluorophoresQuery.fluorophores : null;

        return (
            <Modal bsSize="large" show={this.props.show} onHide={this.props.onClose}
                   aria-labelledby="create-injections-dialog">
                <Modal.Header style={{backgroundColor: "#5bc0de", color: "white"}} closeButton>
                    <Modal.Title id="create-injections-dialog">Injections
                        for {displaySample(sample)}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Tabs id="manage-injections-tabs" bsStyle="pills" activeKey={this.state.activeKey}
                          onSelect={(eventKey: any) => this.onSelectTab(eventKey)}>
                        <Tab eventKey={1} title="Add">
                            {sample ?
                                <AddInjectionPanel sample={sample} injectionViruses={viruses}
                                                   fluorophores={fluorophores}
                                                   onCloseAfterCreate={() => this.props.onClose()}
                                                   onSelectManageTab={() => this.onSelectTab(2)}/> : null }
                        </Tab>
                        <Tab eventKey={2} title="Manage">
                            {sample ? <EditInjectionsPanel sample={sample} injectionViruses={viruses}
                                                           fluorophores={fluorophores}
                                                           onSelectAddTab={() => this.onSelectTab(1)}/> : null }
                        </Tab>
                    </Tabs>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.onClose}>Close</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}
