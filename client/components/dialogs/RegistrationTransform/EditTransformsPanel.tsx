import * as React from "react";
import {
    Table,
    Glyphicon,
    Alert
} from "react-bootstrap";
import {graphql} from 'react-apollo';
import {InjectedGraphQLProps} from "react-apollo/lib/graphql";
import {toast} from "react-toastify";

import {IRegistrationTransform, IRegistrationTransformInput} from "../../../models/registrationTransform";
import {ISample, ISampleInput} from "../../../models/sample";
import {
    DeleteRegistrationMutation, SampleForRegistrationQuery,
    TracingCountQuery, UpdateRegistrationMutation
} from "../../../graphql/registrationTransform";
import {UpdateSampleMutation} from "../../../graphql/sample";
import {
    DynamicEditField, ModalAlert, toastUpdateError,
    toastUpdateSuccess
} from "ndb-react-components";

interface ITracingCountQueryProps {
    tracingCountsForRegistrations: any;
}

interface IEditTransformsProps extends InjectedGraphQLProps<ITracingCountQueryProps> {
    sample: ISample;

    onSelectAddTab(): void;

    updateSample?(sample: ISampleInput): any;
    updateRegistrationTransform?(registrationTransform: IRegistrationTransformInput, sample: ISample): any;
    deleteRegistrationTransform?(registrationTransform: IRegistrationTransformInput, sample: ISample): any;
}

interface IEditTransformsState {
    isDeleteConfirmationShowing?: boolean;
    transformToDelete?: IRegistrationTransform;
    lastDeleteError?: string;
    isInUpdate?: boolean;
}

@graphql(TracingCountQuery, {
    options: ({sample}) => ({
        pollInterval: 5000,
        variables: {
            ids: sample.registrationTransforms.map((obj: IRegistrationTransform) => obj.id)
        }
    }),
    skip: (ownProps) => !ownProps.sample || !ownProps.sample.registrationTransforms
})
@graphql(UpdateRegistrationMutation, {
    props: ({mutate}) => ({
        updateRegistrationTransform: (registrationTransform: IRegistrationTransformInput, sample: ISample) => mutate({
            variables: {registrationTransform},
            refetchQueries: [{
                query: SampleForRegistrationQuery,
                variables: {
                    id: sample.id
                }
            }]
        })
    })
})
@graphql(DeleteRegistrationMutation, {
    props: ({mutate}) => ({
        deleteRegistrationTransform: (registrationTransform: IRegistrationTransformInput, sample: ISample) => mutate({
            variables: {registrationTransform},
            refetchQueries: [{
                query: SampleForRegistrationQuery,
                variables: {
                    id: sample.id
                }
            }]
        })
    })
})
@graphql(UpdateSampleMutation, {
    props: ({mutate}) => ({
        updateSample: (sample: ISampleInput) => mutate({
            variables: {sample}
        })
    })
})
export class EditTransformsPanel extends React.Component<IEditTransformsProps, IEditTransformsState> {
    public constructor(props: IEditTransformsProps) {
        super(props);

        this.state = {
            isDeleteConfirmationShowing: false,
            transformToDelete: null,
            lastDeleteError: null,
            isInUpdate: false
        }
    }

    private async onAcceptLocationEdit(transform: IRegistrationTransform, value: string): Promise<boolean> {
        return this.performUpdate({id: transform.id, location: value});
    }

    private async onAcceptNameEdit(transform: IRegistrationTransform, value: string): Promise<boolean> {
        return this.performUpdate({id: transform.id, name: value});
    }

    private async onAcceptNotesEdit(transform: IRegistrationTransform, value: string): Promise<boolean> {
        return this.performUpdate({id: transform.id, notes: value});
    }

    private async performUpdate(transformPartial: IRegistrationTransformInput): Promise<boolean> {
        try {
            this.setState({isInUpdate: true});

            const result = await this.props.updateRegistrationTransform(transformPartial, this.props.sample);

            if (result.data.updateRegistrationTransform.error) {
                toast.error(toastUpdateError(result.data.updateRegistrationTransform.error), {autoClose: false});
            } else {
                toast.success(toastUpdateSuccess(), {autoClose: 3000});
                return true;
            }
        } catch (error) {
            toast.error(toastUpdateError(error), {autoClose: false});
        }

        this.setState({isInUpdate: false});

        return false;
    }

    private async onUpdateActiveTransform(transform: IRegistrationTransform) {
        try {
            this.setState({isInUpdate: true});

            const result = await this.props.updateSample({
                id: this.props.sample.id,
                activeRegistrationTransformId: transform.id
            });

            if (result.data.updateSample.error) {
                toast.error(toastUpdateError(result.data.updateSample.error), {autoClose: false});
            } else {
                toast.success(toastUpdateSuccess(), {autoClose: 3000});
                return true;
            }
        } catch (error) {
            toast.error(toastUpdateError(error), {autoClose: false});
        }

        this.setState({isInUpdate: false});

        return false;
    }

    private async onDeleteRegistration() {
        if (!this.state.transformToDelete) {
            console.log("Failed to find transform to delete after confirmation.");
            return;
        }

        let deleteError = null;

        try {
            const out = await this.props.deleteRegistrationTransform({id: this.state.transformToDelete.id}, this.props.sample);

            deleteError = out.data.deleteRegistrationTransform.error ? out.data.deleteRegistrationTransform.error.message : null;
        } catch (err) {
            deleteError = err.message;
        }

        this.onClearDeleteConfirmation(deleteError);
    }

    private async onShowDeleteConfirmation(transformToDelete: IRegistrationTransform) {
        this.setState({isDeleteConfirmationShowing: true, transformToDelete});
    }

    private onClearDeleteConfirmation(deleteError: string = null) {
        this.setState({isDeleteConfirmationShowing: false, transformToDelete: null, lastDeleteError: deleteError});
    }

    private renderAlert() {
        const haveTransformError = !this.props.data.loading && this.props.data.tracingCountsForRegistrations.error !== null;

        if (haveTransformError) {
            return (
                <Alert bsStyle="danger">
                    <div>
                        <h4>Could not determine registration usage</h4>
                        {this.props.data.tracingCountsForRegistrations.error.message}
                    </div>
                </Alert>
            );
        }

        const haveDeleteError = this.state.lastDeleteError !== null;

        if (haveDeleteError) {
            return (
                <Alert bsStyle="danger">
                    <div>
                        <h4>Delete Error</h4>
                        {this.state.lastDeleteError}
                    </div>
                </Alert>
            );
        }
    }

    private renderModalAlert() {
        if (!this.state.transformToDelete) {
            return null;
        }

        return (
            <ModalAlert show={this.state.isDeleteConfirmationShowing} style="danger" header="Delete Transform"
                        message={`Are you sure you want to delete ${this.state.transformToDelete.location} as a transform entry?`}
                        acknowledgeContent="Delete" canCancel={true} onCancel={() => this.onClearDeleteConfirmation()}
                        onAcknowledge={() => this.onDeleteRegistration()}/>
        )
    }

    private renderTransforms() {
        let counts: any = {};

        const haveData = !this.props.data.loading && this.props.data.tracingCountsForRegistrations.error === null;

        if (!this.props.data.loading) {
            counts = this.props.data.tracingCountsForRegistrations.counts.reduce((prev: any, curr: any) => {
                prev[curr.transformId] = curr.count;

                return prev;
            }, {});
        }

        const activeSampleId = this.props.sample.activeRegistrationTransform ? this.props.sample.activeRegistrationTransform.id : "";

        const rows = this.props.sample.registrationTransforms.map(t => {
            const count = counts[t.id] ? counts[t.id] : 0;

            const canDelete = count === 0 && haveData && (activeSampleId !== t.id);

            return (
                <tr key={t.id}>
                    <td>
                        {t.id === activeSampleId ? <Glyphicon glyph="star" style={{paddingRight: "10px"}}/> :
                            <a onClick={() => this.onUpdateActiveTransform(t)}>
                                <Glyphicon glyph="star-empty" style={{paddingRight: "10px"}}/>
                            </a>
                        }
                        <DynamicEditField initialValue={t.location} placeHolder="(none)"
                                          canAcceptFunction={v => v.length > 0}
                                          acceptFunction={v => this.onAcceptLocationEdit(t, v)}/>
                    </td>
                    <td>
                        <DynamicEditField initialValue={t.name} placeHolder="(none)"
                                          acceptFunction={v => this.onAcceptNameEdit(t, v)}/>

                    </td>
                    <td>
                        <DynamicEditField initialValue={t.notes} placeHolder="(none)"
                                          acceptFunction={v => this.onAcceptNotesEdit(t, v)}/>
                    </td>
                    <td>
                        {haveData ? count || 0 : "?"}
                        {canDelete ?
                            <a style={{paddingRight: "20px"}} className="pull-right"
                               onClick={() => this.onShowDeleteConfirmation(t)}>
                                <Glyphicon glyph="trash"/>
                            </a>
                            : null}
                    </td>
                </tr>
            )
        });

        return (
            <div>
                <p>
                    You may not remove registrations that are associated with any transformed tracings (see Tracings
                    column).
                </p>
                <p>
                    You may not remove the active registration (choose another as active, or clear the active altogether
                    first).
                </p>
                <p>Modifying the transform location should <span style={emp}>only</span> be done if the original
                    transform file was moved or renamed. It should not be used change the transform as existing
                    transformed
                    tracings linked to the transform will <span style={emp}>not</span> be reapplied. You can <span
                        style={emp}><a
                        onClick={() => this.props.onSelectAddTab()}>Add</a></span> a new transform if the sample
                    registration
                    data has been updated.
                </p>
                <p><
                    Glyphicon glyph="star" style={{paddingRight: "0px"}}/> indicates the active transform.<br/>
                    Click <Glyphicon glyph="star-empty" style={{paddingRight: "0px"}}/> to select a different transform.
                </p>
                <Table>
                    <thead>
                    <tr>
                        <th>Location</th>
                        <th>Name</th>
                        <th>Notes</th>
                        <th>Tracings</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows}
                    </tbody>
                </Table>
                {this.renderModalAlert()}
                {this.renderAlert()}
            </div>
        );
    }

    private renderNoTransforms() {
        return (
            <span>
        There are no transforms for this sample.  You can
        <a onClick={() => this.props.onSelectAddTab()}> Add </a>
        new registration transforms here.
        </span>
        )
    }

    public render() {
        const haveTransforms = this.props.sample.registrationTransforms.length > 0;

        return (
            <div>
                <h4>Edit and Remove Registrations</h4>
                {haveTransforms ? this.renderTransforms() : this.renderNoTransforms()}
            </div>
        );
    }
}

const emp = {
    fontWeight: "bold" as "bold" | 100
};