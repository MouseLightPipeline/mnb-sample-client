import * as React from "react";
import {Modal, Button, FormGroup, FormControl, ControlLabel, HelpBlock, Tabs, Tab} from "react-bootstrap";
import * as update from "immutability-helper";

import {IRegistrationTransform, IRegistrationTransformInput} from "../../models/registrationTransform";
import {ISample} from "../../models/sample";

type ValidationState = "success" | "warning" | "error";

export interface ICreateRegistrationTransformDelegate {
    (registrationTransform: IRegistrationTransform): void;
}

interface ICreateRegistrationTransformDialogProps {
    show: boolean;
    sample: ISample;

    onCreate(registrationTransform: IRegistrationTransformInput): void;
    onCancel(): void;
}

interface ICreateRegistrationTransformDialogState {
}

export class ManageRegistrationTransforms extends React.Component<ICreateRegistrationTransformDialogProps, ICreateRegistrationTransformDialogState> {
    public render() {
        return (
            <Modal show={this.props.show} onHide={this.props.onCancel} aria-labelledby="create-registration-dialog">
                <Modal.Header style={{backgroundColor: "#5bc0de", color: "white"}} closeButton>
                    <Modal.Title id="create-registration-dialog">Registration Transform</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Tabs id="manage-transforms-tabs">
                        <Tab eventKey={1} title="Add">
                            {this.props.sample ?
                                <AddTransform onCreate={this.props.onCreate} sample={this.props.sample}/> : null }
                        </Tab>
                        <Tab eventKey={2} title="Remove">
                        </Tab>
                    </Tabs>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.onCancel}>Close</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

interface IAddTransformProps {
    sample: ISample;
    onCreate(registrationTransform: IRegistrationTransformInput): void;
}

interface IAddRegistrationTransformState {
    registrationTransform?: IRegistrationTransformInput;
}

class AddTransform extends React.Component<IAddTransformProps, IAddRegistrationTransformState> {
    public constructor(props: ICreateRegistrationTransformDialogProps) {
        super(props);

        this.state = {
            registrationTransform: {
                id: null,
                location: "/groups/mousebrainmicro/",
                name: "",
                notes: "",
                sampleId: props.sample.id
            }
        }
    }

    private get isValidCreateState(): boolean {
        return this.state.registrationTransform.location.length > 0
    }

    private get locationValidationState(): ValidationState {
        return this.isValidCreateState ? "success" : "error";
    }

    private onLocationChange(evt: any) {
        this.setState({registrationTransform: Object.assign(this.state.registrationTransform, {location: evt.target.value})})
    }

    private onNameChange(evt: any) {
        this.setState({registrationTransform: Object.assign(this.state.registrationTransform, {name: evt.target.value})})
    }

    private onNotesChange(evt: any) {
        this.setState({registrationTransform: Object.assign(this.state.registrationTransform, {notes: evt.target.value})})
    }

    private renderHelpBlock() {
        return this.state.registrationTransform.location.length > 0 ? "Enter an absolute path reachable by servers performing transform operations" : "Location cannot be empty"
    }

    public componentWillReceiveProps(props: IAddTransformProps) {
        this.setState(update(this.state, {registrationTransform: {sampleId: {$set: props.sample.id}}}));
    }

    public render() {
        return (
            <div>
                <h4>Add a new registration</h4>
                <p>
                    The active registration transform will be used in transform operations from sample
                    coordinates
                    to Allen atlas coordinates when a tracing is associated with the sample. Past
                    registration
                    transforms
                    defined for this sample are retained as they may be referenced by earlier transformation
                    operations.
                </p>
                <p>
                    Registration transforms are defined per-sample, and a given file can only be entered
                    once per
                    sample.
                </p>
                <FormGroup bsSize="sm" controlId="formBasicText"
                           validationState={this.locationValidationState}>
                    <ControlLabel>Full path to transform file</ControlLabel>
                    <FormControl type="text" value={this.state.registrationTransform.location}
                                 placeholder="enter location"
                                 onChange={(e: any) => this.onLocationChange(e)}/>
                    <FormControl.Feedback />
                    <HelpBlock>{this.renderHelpBlock()}</HelpBlock>
                </FormGroup>
                <FormGroup bsSize="sm">
                    <ControlLabel>Name</ControlLabel>
                    <FormControl type="text" value={this.state.registrationTransform.name}
                                 placeholder="enter name"
                                 onChange={(e: any) => this.onNameChange(e)}/>
                    <HelpBlock>Used when displaying transforms. Defaults to filename if not
                        specified.</HelpBlock>
                </FormGroup>
                <FormGroup bsSize="sm">
                    <ControlLabel>Notes</ControlLabel>
                    <FormControl type="text" value={this.state.registrationTransform.notes}
                                 placeholder="enter notes"
                                 onChange={(e: any) => this.onNotesChange(e)}/>
                </FormGroup>
                <Button bsStyle="success" disabled={!this.isValidCreateState}
                        onClick={() => this.props.onCreate(this.state.registrationTransform)}>Add</Button>
            </div>
        );
    }
}
