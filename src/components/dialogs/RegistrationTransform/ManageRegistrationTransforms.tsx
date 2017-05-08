import * as React from "react";
import {
    Modal,
    Button,
    Tabs,
    Tab,
} from "react-bootstrap";

import {IRegistrationTransform, IRegistrationTransformInput} from "../../../models/registrationTransform";
import {ISample} from "../../../models/sample";
import {AddTransformPanel} from "./AddTransformPanel";
import {EditTransformsPanel} from "./EditTransformsPanel";

export interface ICreateRegistrationTransformDelegate {
    (registrationTransform: IRegistrationTransform): void;
}

interface ICreateRegistrationTransformDialogProps {
    show: boolean;
    sample: ISample;

    onCreate(registrationTransform: IRegistrationTransformInput): void;
    onClose(): void;
}

interface ICreateRegistrationTransformDialogState {
    activeKey: any;
}

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
        return (
            <Modal bsSize="large" show={this.props.show} onHide={this.props.onClose}
                   aria-labelledby="create-registration-dialog">
                <Modal.Header style={{backgroundColor: "#5bc0de", color: "white"}} closeButton>
                    <Modal.Title id="create-registration-dialog">Registration Transforms</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Tabs id="manage-transforms-tabs" bsStyle="pills" activeKey={this.state.activeKey}
                          onSelect={(eventKey: any) => this.onSelectTab(eventKey)}>
                        <Tab eventKey={1} title="Add">
                            {this.props.sample ?
                                <AddTransformPanel onCreate={this.props.onCreate} sample={this.props.sample}
                                              onSelectManageTab={() => this.onSelectTab(2)}/> : null }
                        </Tab>
                        <Tab eventKey={2} title="Manage">
                            {this.props.sample ?
                                <EditTransformsPanel sample={this.props.sample} onCreate={this.props.onCreate}
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
