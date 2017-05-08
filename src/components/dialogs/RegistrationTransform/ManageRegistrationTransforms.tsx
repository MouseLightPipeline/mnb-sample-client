import * as React from "react";
import {Modal, Button, Tabs, Tab,} from "react-bootstrap";
import {graphql, InjectedGraphQLProps} from 'react-apollo';
import {displaySample, ISample} from "../../../models/sample";
import {toast} from "react-toastify";

import {AddTransformPanel} from "./AddTransformPanel";
import {EditTransformsPanel} from "./EditTransformsPanel";
import {SampleForRegistrationsQuery} from "../../../graphql/registrationTransform";
import {IRegistrationTransform, IRegistrationTransformInput} from "../../../models/registrationTransform";

export interface ICreateRegistrationTransformDelegate {
    (registrationTransform: IRegistrationTransform): void;
}

interface IManageTransforms {
    sample: ISample;
}

interface ICreateRegistrationTransformDialogProps extends InjectedGraphQLProps<IManageTransforms> {
    show: boolean;
    sampleId: string;

    onCreate(registrationTransform: IRegistrationTransformInput): void;
    onClose(): void;
}

interface ICreateRegistrationTransformDialogState {
    activeKey: any;
}

@graphql(SampleForRegistrationsQuery, {
    options: ({sampleId}) => ({
        pollInterval: 5000,
        variables: {
            id: sampleId
        }
    })
})
export class ManageRegistrationTransforms extends React.Component<ICreateRegistrationTransformDialogProps, ICreateRegistrationTransformDialogState> {
    public constructor(props: ICreateRegistrationTransformDialogProps) {
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

        console.log(sample);

        return (
            <Modal bsSize="large" show={this.props.show} onHide={this.props.onClose}
                   aria-labelledby="create-registration-dialog">
                <Modal.Header style={{backgroundColor: "#5bc0de", color: "white"}} closeButton>
                    <Modal.Title id="create-registration-dialog">Registration Transforms
                        for {displaySample(sample)}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Tabs id="manage-transforms-tabs" bsStyle="pills" activeKey={this.state.activeKey}
                          onSelect={(eventKey: any) => this.onSelectTab(eventKey)}>
                        <Tab eventKey={1} title="Add">
                            {sample ?
                                <AddTransformPanel onCreate={this.props.onCreate} sample={sample}
                                                   onSelectManageTab={() => this.onSelectTab(2)}/> : null }
                        </Tab>
                        <Tab eventKey={2} title="Manage">
                            {sample ?
                                <EditTransformsPanel sample={sample} onCreate={this.props.onCreate}
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
