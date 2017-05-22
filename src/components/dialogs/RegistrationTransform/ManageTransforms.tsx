import * as React from "react";
import {Modal, Button, Tabs, Tab,} from "react-bootstrap";
import {graphql, InjectedGraphQLProps} from 'react-apollo';
import {displaySample, ISample} from "../../../models/sample";
import {toast} from "react-toastify";

import {AddTransformPanel} from "./AddTransformPanel";
import {EditTransformsPanel} from "./EditTransformsPanel";
import {SampleForRegistrationQuery} from "../../../graphql/registrationTransform";

interface IManageTransformsQueryProps {
    sample: ISample;
}

interface IManageTransformsProps extends InjectedGraphQLProps<IManageTransformsQueryProps> {
    show: boolean;
    sampleId: string;

    onClose(): void;
}

interface IManageTransformsState {
    activeKey: any;
}

@graphql(SampleForRegistrationQuery, {
    options: ({sampleId}) => ({
        pollInterval: 5000,
        variables: {
            id: sampleId
        }
    })
})
export class ManageTransforms extends React.Component<IManageTransformsProps, IManageTransformsState> {
    public constructor(props: IManageTransformsProps) {
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
                                <AddTransformPanel sample={sample}
                                                   onCloseAfterCreate={() => this.props.onClose()}
                                                   onSelectManageTab={() => this.onSelectTab(2)}/> : null }
                        </Tab>
                        <Tab eventKey={2} title="Manage">
                            {sample ?
                                <EditTransformsPanel sample={sample}
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
