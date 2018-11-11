import * as React from "react";
import {toast} from "react-toastify";
import {Button, Table, Segment, Confirm, Header} from "semantic-ui-react";

import {ManageTransforms} from "../transforms/ManageTransforms";
import {ManageInjections} from "../injections/ManageInjections";
import {toastCreateError, toastDeleteError} from "../elements/Toasts";
import {displaySample, ISample} from "../../models/sample";
import {IMouseStrain} from "../../models/mouseStrain";
import {SampleRow} from "./SampleRow";
import {PaginationHeader} from "../elements/PaginationHeader";
import {UserPreferences} from "../../util/userPreferences";
import {
    CREATE_SAMPLE_MUTATION,
    CreateSampleMutation,
    CreateSampleMutationData, DELETE_SAMPLE_MUTATION,
    DeleteSampleMutation
} from "../../graphql/sample";

interface ISamplesProps {
    samples: ISample[];
    mouseStrains: IMouseStrain[];
}

interface ISamplesState {
    offset?: number;
    limit?: number;
    requestedSampleForDelete?: ISample;
    isTransformDialogShown?: boolean;
    manageTransformsSample?: ISample;
    isInjectionDialogShown?: boolean;
    manageInjectionsSample?: ISample;
}

export class SamplesTable extends React.Component<ISamplesProps, ISamplesState> {
    public constructor(props: ISamplesProps) {
        super(props);

        this.state = {
            offset: UserPreferences.Instance.samplePageOffset,
            limit: UserPreferences.Instance.samplePageLimit,
            requestedSampleForDelete: null,
            isTransformDialogShown: false,
            manageTransformsSample: null,
            isInjectionDialogShown: false,
            manageInjectionsSample: null
        }
    }

    public componentWillReceiveProps(props: ISamplesProps) {
        if (this.state.manageTransformsSample) {
            const s = props.samples.find(s => s.id === this.state.manageTransformsSample.id);
            if (s) {
                this.setState({manageTransformsSample: s});
            }
        }

        if (this.state.manageInjectionsSample) {
            const s = props.samples.find(s => s.id === this.state.manageInjectionsSample.id);
            if (s) {
                this.setState({manageInjectionsSample: s});
            }
        }
    }

    private onUpdateOffsetForPage(page: number) {
        const offset = this.state.limit * (page - 1);

        if (offset !== this.state.offset) {
            this.setState({offset});

            UserPreferences.Instance.samplePageOffset = offset;
        }
    }

    private onUpdateLimit(limit: number) {
        if (limit !== this.state.limit) {
            let offset = this.state.offset;

            if (offset < limit) {
                offset = 0;
            }

            this.setState({offset, limit});

            UserPreferences.Instance.samplePageOffset = offset;
            UserPreferences.Instance.samplePageLimit = limit;
        }
    }

    private onRequestAddRegistrationTransform(forSample: ISample) {
        this.setState({
            isTransformDialogShown: true,
            manageTransformsSample: forSample,
        });
    }

    private onRequestManageInjections(forSample: ISample) {
        this.setState({
            isInjectionDialogShown: true,
            manageInjectionsSample: forSample
        });
    }

    private renderTransformsDialog() {
        if (this.state.manageTransformsSample && this.state.isTransformDialogShown) {
            return (
                <ManageTransforms sample={this.state.manageTransformsSample}
                                  show={this.state.isTransformDialogShown}
                                  onClose={() => this.setState({isTransformDialogShown: false})}/>
            );
        } else {
            return null;
        }
    }

    private renderInjectionsDialog() {
        if (this.state.manageInjectionsSample && this.state.isInjectionDialogShown) {
            return (
                <ManageInjections sample={this.state.manageInjectionsSample}
                                  show={this.state.isInjectionDialogShown}
                                  onClose={() => this.setState({isInjectionDialogShown: false})}/>
            );
        } else {
            return null;
        }
    }

    private renderDeleteConfirmationModal() {
        if (!this.state.requestedSampleForDelete) {
            return null;
        }

        return <DeleteSampleMutation mutation={DELETE_SAMPLE_MUTATION} refetchQueries={["AppQuery"]}
                                     onError={(error) => toast.error(toastDeleteError(error), {autoClose: false})}>
            {(deleteSample) => (
                <Confirm open={true} dimmer="blurring"
                         header="Delete Sample?"
                         content={`Are you sure you want to delete the sample ${displaySample(this.state.requestedSampleForDelete)}?`}
                         confirmButton="Delete"
                         onCancel={() => this.setState({requestedSampleForDelete: null})}
                         onConfirm={() => {
                             deleteSample({variables: {sample: {id: this.state.requestedSampleForDelete.id}}});
                             this.setState({requestedSampleForDelete: null});
                         }}/>)}
        </DeleteSampleMutation>;
    }

    public render() {
        const samples = this.props.samples.sort((a, b) => b.createdAt - a.createdAt).slice(this.state.offset, this.state.offset + this.state.limit);

        const totalCount = this.props.samples.length;

        const pageCount = Math.ceil(totalCount / this.state.limit);

        const activePage = (this.state.offset ? (Math.floor(this.state.offset / this.state.limit) + 1) : 1);

        const start = this.state.offset + 1;
        const end = Math.min(this.state.offset + this.state.limit, totalCount);

        const rows = samples.map(s => {
            return <SampleRow key={`sl_${s.id}`} sample={s} mouseStrains={this.props.mouseStrains}
                              onRequestDeleteSample={(s) => this.setState({requestedSampleForDelete: s})}
                              onRequestAddRegistrationTransform={(s) => this.onRequestAddRegistrationTransform(s)}
                              onRequestManageInjections={(s) => this.onRequestManageInjections(s)}/>
        });

        return (
            <div>
                {this.renderTransformsDialog()}
                {this.renderInjectionsDialog()}
                {this.renderDeleteConfirmationModal()}
                <Segment.Group>
                    <Segment secondary style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                        <Header content="Samples" style={{margin: "0"}}/>
                        <CreateSampleMutation mutation={CREATE_SAMPLE_MUTATION} refetchQueries={["AppQuery"]}
                                              onCompleted={(data) => onSampleCreated(data.createSample)}
                                              onError={(error) => toast.error(toastCreateError(error), {autoClose: false})}>
                            {(createSample) => (
                                <Button content="Add" icon="add" size="tiny" labelPosition="right" color="blue"
                                        floated="right" onClick={() => createSample({variables: {sample: {}}})}/>
                            )}
                        </CreateSampleMutation>
                    </Segment>
                    <Segment>
                        <PaginationHeader pageCount={pageCount}
                                          activePage={activePage}
                                          limit={this.state.limit}
                                          onUpdateLimitForPage={limit => this.onUpdateLimit(limit)}
                                          onUpdateOffsetForPage={page => this.onUpdateOffsetForPage(page)}/>
                    </Segment>
                    <Table attached="bottom" compact="very">
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Id</Table.HeaderCell>
                                <Table.HeaderCell>Tag</Table.HeaderCell>
                                <Table.HeaderCell>Animal Id</Table.HeaderCell>
                                <Table.HeaderCell>Acq. Date</Table.HeaderCell>
                                <Table.HeaderCell>Strain</Table.HeaderCell>
                                <Table.HeaderCell>Registrations</Table.HeaderCell>
                                <Table.HeaderCell>Injections</Table.HeaderCell>
                                <Table.HeaderCell>Comment</Table.HeaderCell>
                                <Table.HeaderCell>Visibility</Table.HeaderCell>
                                <Table.HeaderCell>Created</Table.HeaderCell>
                                <Table.HeaderCell/>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {rows}
                        </Table.Body>
                        <Table.Footer fullwidth="true">
                            <Table.Row>
                                <Table.HeaderCell colSpan={5}>
                                    {totalCount >= 0 ? (totalCount > 0 ? `Showing ${start} to ${end} of ${totalCount} samples` : "It's a clean slate - create the first sample!") : ""}
                                </Table.HeaderCell>
                                <Table.HeaderCell colSpan={6} textAlign="right">
                                    {`Page ${activePage} of ${pageCount}`}
                                </Table.HeaderCell>
                            </Table.Row>
                        </Table.Footer>
                    </Table>
                </Segment.Group>
            </div>
        );
    }
}

function onSampleCreated(data: CreateSampleMutationData) {
    if (!data.sample || data.error) {
        toast.error(toastCreateError(data.error.message), {autoClose: false});
    }
}
