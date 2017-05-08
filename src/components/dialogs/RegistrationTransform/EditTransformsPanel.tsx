import * as React from "react";
import {
    Table,
    Glyphicon,
    Alert
} from "react-bootstrap";
import {graphql} from 'react-apollo';
import gql from "graphql-tag";
import {InjectedGraphQLProps} from "react-apollo/lib/graphql";

import {IRegistrationTransform, IRegistrationTransformInput} from "../../../models/registrationTransform";
import {ISample} from "../../../models/sample";
import {DynamicEditField} from "../../util/DynamicEditField";

const TracingCountQuery = gql`query TracingCounts {
    tracingCountsForRegistrations {
      counts {
        transformId
        count
      }
      error {
        message
      }
    }
}`;

const DeleteRegistrationTransformMutation = gql`mutation deleteRegistrationTransform($registrationTransform: RegistrationTransformInput) {
  deleteRegistrationTransform(registrationTransform: $registrationTransform) {
    registrationTransform {
        id
    }
    error {
      message
    }
  }
}`;

interface ITracingCountQueryProps {
    tracingCountsForRegistrations: any;
}

interface IRemoveTransformProps extends InjectedGraphQLProps<ITracingCountQueryProps> {
    sample: ISample;

    onCreate(registrationTransform: IRegistrationTransformInput): void;
    onSelectAddTab(): void;
}

interface IRemoveRegistrationTransformState {
    registrationTransform?: IRegistrationTransformInput;
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
export class EditTransformsPanel extends React.Component<IRemoveTransformProps, IRemoveRegistrationTransformState> {
    private async onAcceptLocationEdit(value: string): Promise<boolean> {
        return true;
    }

    private async onAcceptNameEdit(value: string): Promise<boolean> {
        return true;
    }

    private async onAcceptNotesEdit(value: string): Promise<boolean> {
        return true;
    }

    private onShowDeleteConfirmation() {
    }

    private renderAlert() {
        const haveError = !this.props.data.loading && this.props.data.tracingCountsForRegistrations.error !== null;

        if (haveError) {

            return (
                <Alert bsStyle="danger">
                    <div>
                        <h4>Could not determine registration usage</h4>
                        {this.props.data.tracingCountsForRegistrations.error.message}
                    </div>
                </Alert>
            );
        } else {
            return null;
        }
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

        const rows = this.props.sample.registrationTransforms.map(t => {
            const count = counts[t.id] ? counts[t.id] : 0;

            return (
                <tr key={t.id}>
                    <td>
                        <DynamicEditField initialValue={t.location} placeHolder="(none)"
                                          acceptFunction={v => this.onAcceptLocationEdit(v)}/>
                    </td>
                    <td>
                        <DynamicEditField initialValue={t.name} placeHolder="(none)"
                                          acceptFunction={v => this.onAcceptNameEdit(v)}/>

                    </td>
                    <td>
                        <DynamicEditField initialValue={t.notes} placeHolder="(none)"
                                          acceptFunction={v => this.onAcceptNotesEdit(v)}/>
                    </td>
                    <td>
                        {haveData ? count || 0 : "?"}
                        {count === 0 && haveData ?
                            <a style={{paddingRight: "20px"}} className="pull-right"
                               onClick={() => this.onShowDeleteConfirmation()}>
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
                    Registrations can only be removed if they are not associated with any transformed tracings.
                </p>
                <p>Modifying the transform location should <span style={emp}>only</span> be done if the original
                    transform was moved or renamed. It should not be used change the transform as existing transformed
                    tracings linked to the transform will <span style={emp}>not</span> be rerun. You can <a
                        onClick={() => this.props.onSelectAddTab()}>Add</a> a new transform if the sample registration
                    data has been updated.
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
