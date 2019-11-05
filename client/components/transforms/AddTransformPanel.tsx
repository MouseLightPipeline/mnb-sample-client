import * as React from "react";
import {Header, Form, Button, Input} from "semantic-ui-react";
import {toast} from "react-toastify";
import update from "immutability-helper";

import {ISample} from "../../models/sample";
import {toastCreateError, toastCreateSuccess} from "../elements/Toasts";
import {
    CREATE_TRANSFORM_MUTATION,
    CreateTransformMutation,
    CreateTransformMutationData,
    TransformVariables
} from "../../graphql/transform";

interface IAddTransformProps {
    sample: ISample;

    onSelectManageTab(): void;
}

interface IAddRegistrationTransformState {
    registrationTransform?: TransformVariables;
}

export class AddTransformPanel extends React.Component<IAddTransformProps, IAddRegistrationTransformState> {
    public constructor(props: IAddTransformProps) {
        super(props);

        this.state = {
            registrationTransform: {
                id: null,
                location: "/groups/mousebrainmicro/mousebrainmicro",
                name: "",
                notes: "",
                sampleId: props.sample.id
            }
        }
    }

    private get isValidCreateState(): boolean {
        const match = this.props.sample.registrationTransforms.find(t => t.location === this.state.registrationTransform.location);

        return this.state.registrationTransform.location.length > 0 && (match === undefined);
    }

    private onLocationChange(value: string) {
        this.setState({registrationTransform: Object.assign(this.state.registrationTransform, {location: value})})
    }

    private onNameChange(value: string) {
        this.setState({registrationTransform: Object.assign(this.state.registrationTransform, {name: value})})
    }

    private onNotesChange(value: string) {
        this.setState({registrationTransform: Object.assign(this.state.registrationTransform, {notes: value})})
    }

    private renderHelpBlock() {
        const match = this.props.sample.registrationTransforms.find(t => t.location === this.state.registrationTransform.location);

        if (match) {
            return (
                <span style={{fontSize: "small", fontStyle: "italic"}}>
                    {`An entry for ${this.state.registrationTransform.location} already exists.  You can modify existing transforms on the `}
                    <a onClick={() => this.props.onSelectManageTab()}>Manage</a>
                    {` tab.`}
                </span>
            )
        }

        return <span style={{fontSize: "small", fontStyle: "italic"}}>Enter an absolute path reachable by servers performing transform operations</span>;
    }

    public componentWillReceiveProps(props: IAddTransformProps) {
        this.setState(update(this.state, {registrationTransform: {sampleId: {$set: props.sample.id}}}));
    }

    public render() {
        return (
            <div>
                <Header>
                    Add Registration
                    <Header.Subheader>
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
                    </Header.Subheader>
                </Header>
                <Form>
                    <Form.Field>
                        <label>Full path to HDF5 transform file</label>
                        <Input value={this.state.registrationTransform.location}
                               placeholder="Location is required"
                               error={this.state.registrationTransform.location.length === 0}
                               onChange={(e, {value}) => this.onLocationChange(value)}/>
                        {this.renderHelpBlock()}
                    </Form.Field>
                    <Form.Field>
                        <label>Name</label>
                        <Input value={this.state.registrationTransform.name}
                               placeholder="(optional)"
                               onChange={(e, {value}) => this.onNameChange(value)}/>
                        <span style={{fontSize: "small", fontStyle: "italic"}}>Used when displaying transforms. Defaults to filename if not
                            specified.</span>
                    </Form.Field>
                    <Form.Field>
                        <label>Notes</label>
                        <Input value={this.state.registrationTransform.notes}
                               placeholder="(optional)"
                               onChange={(e, {value}) => this.onNotesChange(value)}/>
                    </Form.Field>
                    <CreateTransformMutation mutation={CREATE_TRANSFORM_MUTATION} refetchQueries={["AppQuery"]}
                                             onCompleted={(data) => onTransformCreated(data.createRegistrationTransform)}
                                             onError={(error) => toast.error(toastCreateError(error), {autoClose: false})}>
                        {(createRegistrationTransform) => (
                            <Button color="teal" disabled={!this.isValidCreateState}
                                    onClick={() => createRegistrationTransform({variables: {registrationTransform: this.state.registrationTransform, makeActive: true}})}>Add
                                and Make Active</Button>
                        )}
                    </CreateTransformMutation>
                </Form>
            </div>
        );
    }
}

function onTransformCreated(data: CreateTransformMutationData) {
    if (!data.source || data.error) {
        toast.error(toastCreateError(data.error), {autoClose: false});
    } else {
        toast.success(toastCreateSuccess());
    }
}
