import * as React from "react";
import {Button, Confirm, Icon, Table, Label, Header} from "semantic-ui-react";
import {toast} from "react-toastify";

import {IRegistrationTransform} from "../../models/registrationTransform";
import {ISample} from "../../models/sample";
import {
    toastCreateError,
    toastDeleteError,
    toastDeleteSuccess,
    toastUpdateError
} from "../elements/Toasts";
import {DynamicEditField} from "../elements/DynamicEditField";
import {
    DELETE_TRANSFORM_MUTATION,
    DeleteTransformMutation,
    TransformTracingCount, UPDATE_TRANSFORM_MUTATION, UpdateTransformMutation, UpdateTransformMutationData,
    UpdateTransformMutationFn
} from "../../graphql/transform";
import {UPDATE_SAMPLE_MUTATION, UpdateSampleMutation, UpdateSampleMutationData} from "../../graphql/sample";

interface IEditTransformsProps {
    sample: ISample;
    transformCounts: TransformTracingCount[];

    onSelectAddTab(): void;
}

interface IEditTransformsState {
    deletedTransforms: string[];
    isDeleteConfirmationShowing?: boolean;
    transformToDelete?: IRegistrationTransform;
    lastDeleteError?: string;
}

export class EditTransformsPanel extends React.Component<IEditTransformsProps, IEditTransformsState> {
    public constructor(props: IEditTransformsProps) {
        super(props);

        this.state = {
            isDeleteConfirmationShowing: false,
            transformToDelete: null,
            lastDeleteError: null,
            deletedTransforms: []
        }
    }

    private async onShowDeleteConfirmation(transformToDelete: IRegistrationTransform) {
        this.setState({isDeleteConfirmationShowing: true, transformToDelete});
    }

    private onClearDeleteConfirmation(deleteError: string = null) {
        this.setState({isDeleteConfirmationShowing: false, transformToDelete: null, lastDeleteError: deleteError});
    }

    private onTransformDelete(data: any) {
        this.onClearDeleteConfirmation();

        if (!data.registrationTransform || data.error) {
            toast.error(toastDeleteError(data.error.message), {autoClose: false});
        } else {
            this.setState({deletedTransforms: this.state.deletedTransforms.concat([data.registrationTransform.id])});
            toast.success(toastDeleteSuccess());
        }
    }

    private onTransformDeleteError = (error: Error) => {
        toast.error(toastDeleteError(error), {autoClose: false});
        this.onClearDeleteConfirmation();
    };

    private renderDeleteConfirmation() {
        if (this.state.transformToDelete === null) {
            return null;
        }

        return (
            <DeleteTransformMutation mutation={DELETE_TRANSFORM_MUTATION} refetchQueries={["AppQuery"]}
                                     onCompleted={(data) => this.onTransformDelete(data.deleteRegistrationTransform)}
                                     onError={this.onTransformDeleteError}>
                {(deleteRegistrationTransform) => (
                    <Confirm open={this.state.isDeleteConfirmationShowing} header="Delete Transform"
                             content={`Are you sure you want to delete ${this.state.transformToDelete.location} as a transform entry?`}
                             confirmButton="Delete" onCancel={() => this.onClearDeleteConfirmation()}
                             onConfirm={() => {
                                 deleteRegistrationTransform({variables: {registrationTransform: {id: this.state.transformToDelete.id}}})
                             }}/>
                )}
            </DeleteTransformMutation>
        )
    }

    private renderTransforms(transforms: IRegistrationTransform[]) {
        const tracingCounts = new Map<string, number>();

        this.props.transformCounts.map(c => tracingCounts.set(c.transformId, c.count));

        const activeSampleId = this.props.sample.activeRegistrationTransform ? this.props.sample.activeRegistrationTransform.id : "";

        const rows = transforms.map(t => {
            const count = tracingCounts.get(t.id);

            return (
                <UpdateTransformMutation mutation={UPDATE_TRANSFORM_MUTATION} key={t.id}
                                         onCompleted={(data) => onTransformUpdated(data.updateRegistrationTransform)}
                                         onError={(error) => toast.error(toastUpdateError(error), {autoClose: false})}>
                    {(updateRegistrationTransform) => (
                        <Table.Row key={t.id}>
                            <Table.Cell>
                                <UpdateSampleMutation mutation={UPDATE_SAMPLE_MUTATION} refetchQueries={["AppQuery"]}
                                                      onCompleted={(data) => onSampleUpdated(data.updateSample)}
                                                      onError={(error) => toast.error(toastUpdateError(error), {autoClose: false})}>
                                    {(updateSample) =>
                                        (
                                            <div>
                                                {t.id === activeSampleId ?
                                                    <Icon name="star" style={{paddingRight: "10px"}}/> :
                                                    <Icon name="star outline" style={{paddingRight: "10px"}}
                                                          onClick={() => updateSample({
                                                              variables: {
                                                                  sample: {
                                                                      id: this.props.sample.id,
                                                                      activeRegistrationTransformId: t.id
                                                                  }
                                                              }
                                                          })}/>
                                                }
                                                <DynamicEditField initialValue={t.location} placeHolder="(none)"
                                                                  canAcceptFunction={v => v.length > 0}
                                                                  acceptFunction={v => onAcceptLocationEdit(t, v, updateRegistrationTransform)}/>
                                            </div>
                                        )}
                                </UpdateSampleMutation>
                            </Table.Cell>
                            <Table.Cell>
                                <DynamicEditField initialValue={t.name} placeHolder="(none)"
                                                  acceptFunction={v => onAcceptNameEdit(t, v, updateRegistrationTransform)}/>

                            </Table.Cell>
                            <Table.Cell>
                                <DynamicEditField initialValue={t.notes} placeHolder="(none)"
                                                  acceptFunction={v => onAcceptNotesEdit(t, v, updateRegistrationTransform)}/>
                            </Table.Cell>
                            <Table.Cell style={{minWidth: "120px"}}>
                                {count !== undefined ? (count === 0 ?
                                    <Button icon="trash" color="red" size="mini" content="delete" labelPosition="left"
                                            onClick={() => this.onShowDeleteConfirmation(t)}/> :
                                    <Label>{count}<Label.Detail>neurons</Label.Detail></Label>) : "?"}
                            </Table.Cell>
                        </Table.Row>
                    )}
                </UpdateTransformMutation>
            )
        });

        return (
            <div>
                <Header>
                    Modify and Delete Transforms
                    <Header.Subheader>
                        <p>
                            You may not remove transforms that are associated with any transformed tracings (see
                            Tracings
                            column).
                        </p>
                        <p>
                            You may not remove the active transform (choose another as active, or clear the active
                            altogether
                            first).
                        </p>
                        <p>Modifying the transform location should <span style={emp}>only</span> be done if the original
                            transform file was moved or renamed. It should not be used change the transform as existing
                            transformed
                            tracings linked to the transform will <span style={emp}>not</span> be reapplied. You
                            can <span
                                style={emp}><a
                                onClick={() => this.props.onSelectAddTab()}>add a new transform</a></span> if the sample
                            registration
                            data has been updated.
                        </p>
                        <p>
                            <Icon name="star" style={{paddingRight: "0px"}}/> indicates the active transform.<br/>
                            <Icon name="star outline" style={{paddingRight: "0px"}}/> can be used to select a different
                            active transform.
                        </p>
                    </Header.Subheader>
                </Header>
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Location</Table.HeaderCell>
                            <Table.HeaderCell>Name</Table.HeaderCell>
                            <Table.HeaderCell>Notes</Table.HeaderCell>
                            <Table.HeaderCell>Tracings</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {rows}
                    </Table.Body>
                </Table>
                {this.renderDeleteConfirmation()}
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
        );
    }

    public render() {
        const transforms = this.props.sample.registrationTransforms.filter(i => this.state.deletedTransforms.find(id => id === i.id) === undefined);

        return transforms.length > 0 ? this.renderTransforms(transforms) : this.renderNoTransforms();
    }
}


async function onAcceptLocationEdit(transform: IRegistrationTransform, value: string, updateFn: UpdateTransformMutationFn) {
    if (value !== transform.location) {
        await updateFn({variables: {registrationTransform: {id: transform.id, location: value}}});
    }
}

async function onAcceptNameEdit(transform: IRegistrationTransform, value: string, updateFn: UpdateTransformMutationFn) {
    if (value !== transform.name) {
        await updateFn({variables: {registrationTransform: {id: transform.id, name: value}}});
    }
}

async function onAcceptNotesEdit(transform: IRegistrationTransform, value: string, updateFn: UpdateTransformMutationFn) {
    if (value !== transform.notes) {
        await updateFn({variables: {registrationTransform: {id: transform.id, notes: value}}});
    }
}

function onTransformUpdated(data: UpdateTransformMutationData) {
    if (!data.registrationTransform || data.error) {
        toast.error(toastCreateError(data.error.message), {autoClose: false});
    }
}

function onSampleUpdated(data: UpdateSampleMutationData) {
    if (!data.sample || data.error) {
        toast.error(toastCreateError(data.error.message), {autoClose: false});
    } else {

    }
}

const emp = {
    fontWeight: "bold" as "bold" | 100,
    textDecoration: "underline"
};