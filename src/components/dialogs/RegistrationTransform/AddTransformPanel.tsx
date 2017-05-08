import * as React from "react";
import {Button, FormGroup, FormControl, ControlLabel, HelpBlock,} from "react-bootstrap";

import * as update from "immutability-helper";

import {IRegistrationTransformInput} from "../../../models/registrationTransform";
import {ISample} from "../../../models/sample";

type ValidationState = "success" | "warning" | "error";
interface IAddTransformProps {
    sample: ISample;

    onCreate(registrationTransform: IRegistrationTransformInput): void;
    onSelectManageTab(): void;
}

interface IAddRegistrationTransformState {
    registrationTransform?: IRegistrationTransformInput;
}

export class AddTransformPanel extends React.Component<IAddTransformProps, IAddRegistrationTransformState> {
    public constructor(props: IAddTransformProps) {
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
        const isMatching = this.props.sample.registrationTransforms.filter(t => t.location === this.state.registrationTransform.location);

        return this.state.registrationTransform.location.length > 0 && isMatching.length === 0;
    }

    private get locationValidationState(): ValidationState {
        return this.isValidCreateState ? null : "error";
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
        if (this.state.registrationTransform.location.length === 0) {
            return "Location is required"
        }

        const isMatching = this.props.sample.registrationTransforms.filter(t => t.location === this.state.registrationTransform.location);
        if (isMatching.length > 0) {
            return (
                <span>
                    {`An entry for ${this.state.registrationTransform.location} already exists.  You can modify existing transforms on the `}
                    <a onClick={() => this.props.onSelectManageTab()}>Manage</a>
                    {` tab.`}
                </span>
            )
        }

        return "Enter an absolute path reachable by servers performing transform operations";
    }

    public componentWillReceiveProps(props: IAddTransformProps) {
        this.setState(update(this.state, {registrationTransform: {sampleId: {$set: props.sample.id}}}));
    }

    public render() {
        return (
            <div>
                <h4>Add Registration</h4>
                <p>
                    The active registration transform will be used in transform operations from sample
                    coordinates to Allen atlas coordinates.
                </p>
                <p>
                    Past registration transforms defined for this sample are
                    retained as they may be referenced by earlier transformation operations.
                </p>
                <p>
                    Registration transforms are defined per-sample. A given transform file can only be defined
                    once per sample.
                </p>
                <FormGroup bsSize="sm" controlId="formBasicText"
                           validationState={this.locationValidationState}>
                    <ControlLabel>Full path to HDF5 transform file</ControlLabel>
                    <FormControl type="text" value={this.state.registrationTransform.location}
                                 placeholder="location is required"
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
