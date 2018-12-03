import * as React from "react";
import {Button, Dropdown, Segment, Grid, Confirm, Table, Header} from "semantic-ui-react";
import {toast} from "react-toastify";

import {InjectionsForSampleDropdown} from "../editors/InjectionForSampleDropdown";
import {toastCreateError, toastDeleteError} from "../elements/Toasts";
import {PaginationHeader} from "../elements/PaginationHeader";
import {UserPreferences} from "../../util/userPreferences";
import {
    CREATE_NEURON_MUTATION,
    CreateNeuronMutation,
    CreateNeuronMutationData, DELETE_NEURON_MUTATION, DeleteNeuronMutation,
    NEURONS_QUERY,
    NeuronsQuery
} from "../../graphql/neuron";
import {displaySample, ISample} from "../../models/sample";
import {IInjection} from "../../models/injection";
import {NeuronsTable} from "./NeuronsTable";
import {displayNeuron, INeuron} from "../../models/neuron";

interface INeuronsProps {
    samples: ISample[];
}

interface INeuronsState {
    offset?: number;
    limit?: number;
    sample?: ISample;
    isSampleLocked?: boolean;
    injection: IInjection;
    requestedNeuronForDelete?: INeuron;
}

export class Neurons extends React.Component<INeuronsProps, INeuronsState> {
    public constructor(props: INeuronsProps) {
        super(props);

        let sample: ISample = null;
        let isSampleLocked = false;

        if (UserPreferences.Instance.neuronCreateLockedSampleId.length > 0) {
            sample = props.samples.find(s => s.id === UserPreferences.Instance.neuronCreateLockedSampleId) || null;
            isSampleLocked = sample != null;
        }

        this.state = {
            offset: UserPreferences.Instance.neuronPageOffset,
            limit: UserPreferences.Instance.neuronPageLimit,
            sample,
            injection: null,
            isSampleLocked
        }
    }

    public componentWillReceiveProps(props: INeuronsProps) {
        const lockedSampleId = UserPreferences.Instance.neuronCreateLockedSampleId;

        let sample = this.state.sample;

        if (lockedSampleId) {
            sample = props.samples.find((s: ISample) => s.id === lockedSampleId);
        } else if (this.state.sample) {
            sample = props.samples.find((s: ISample) => s.id === sample.id);
        }

        if (sample) {
            this.setState({sample: sample, isSampleLocked: lockedSampleId.length > 0});
        } else {
            this.setState({sample: null, isSampleLocked: false});
        }
    }

    private onUpdateOffsetForPage = (page: number) => {
        const offset = this.state.limit * (page - 1);

        if (offset !== this.state.offset) {
            this.setState({offset});

            UserPreferences.Instance.neuronPageOffset = offset;
        }
    };

    private onUpdateLimit = (limit: number) => {
        if (limit !== this.state.limit) {
            let offset = this.state.offset;

            if (offset < limit) {
                offset = 0;
            }

            this.setState({offset, limit});

            UserPreferences.Instance.neuronPageOffset = offset;
            UserPreferences.Instance.neuronPageLimit = limit;
        }
    };

    private onSampleChange(sampleId: string) {
        if (!this.state.sample || sampleId !== this.state.sample.id) {
            this.setState({sample: this.props.samples.find(s => s.id === sampleId) || null, injection: null});
        }
    }

    private onLockSample() {
        // Based on current state so if locked, clear locked sample, etc.
        UserPreferences.Instance.neuronCreateLockedSampleId = this.state.isSampleLocked ? "" : this.state.sample.id;

        this.setState({isSampleLocked: !this.state.isSampleLocked});
    }

    private onInjectionChange(injection: IInjection) {
        if (injection !== this.state.injection) {
            this.setState({injection});
        }
    }

    private renderCreateNeuron() {
        const items = this.props.samples.map(s => {
            return {value: s.id, text: displaySample(s)}
        });

        return (
            <CreateNeuronMutation mutation={CREATE_NEURON_MUTATION} refetchQueries={["NeuronsQuery"]}
                                  onCompleted={(data) => onNeuronCreated(data.createNeuron)}
                                  onError={(error) => toast.error(toastCreateError(error), {autoClose: false})}>
                {(createNeuron) => (
                    <Table style={{
                        border: "none",
                        background: "transparent",
                        marginTop: 0,
                        maxWidth: "820px",
                        textAlign: "right"
                    }}>
                        <Table.Body>
                            <Table.Row>
                                <Table.Cell style={{padding: 0, width: "300px"}}>
                                    <Button as="div" fluid labelPosition="left">
                                        <Dropdown search fluid selection options={items}
                                                  className="label"
                                                  placeholder="Select sample..."
                                                  disabled={this.state.isSampleLocked || this.props.samples.length === 0}
                                                  value={this.state.sample ? this.state.sample.id : null}
                                                  onChange={(e, {value}) => this.onSampleChange(value as string)}
                                                  style={{fontWeight: "normal"}}/>
                                        <Button compact icon="lock" color={this.state.isSampleLocked ? "red" : null}
                                                disabled={this.state.sample === null}
                                                active={this.state.isSampleLocked}
                                                onClick={() => this.onLockSample()}/>
                                    </Button>
                                </Table.Cell>

                                <Table.Cell style={{padding: 0, paddingLeft: "20px", width: "400px"}}>
                                    <InjectionsForSampleDropdown sample={this.state.sample}
                                                                 selectedInjection={this.state.injection}
                                                                 onInjectionChange={n => this.onInjectionChange(n)}
                                                                 disabled={this.state.sample === null}/>
                                </Table.Cell>

                                <Table.Cell style={{padding: 0}}>
                                    <Button content="Add" icon="add" size="small" labelPosition="right" color="blue"
                                            disabled={this.state.injection === null}
                                            onClick={() => createNeuron({variables: {neuron: {injectionId: this.state.injection.id}}})}/>
                                </Table.Cell>
                            </Table.Row>
                        </Table.Body>
                    </Table>
                )}
            </CreateNeuronMutation>
        );
    }

    private renderDeleteConfirmationModal() {
        if (!this.state.requestedNeuronForDelete) {
            return null;
        }

        return <DeleteNeuronMutation mutation={DELETE_NEURON_MUTATION} refetchQueries={["NeuronsQuery"]}
                                     onError={(error) => toast.error(toastDeleteError(error), {autoClose: false})}>
            {(deleteNeuron) => (
                <Confirm open={true} dimmer="blurring"
                         header="Delete Neuron?"
                         content={`Are you sure you want to delete the neuron ${displayNeuron(this.state.requestedNeuronForDelete)}?`}
                         confirmButton="Delete"
                         onCancel={() => this.setState({requestedNeuronForDelete: null})}
                         onConfirm={() => {
                             deleteNeuron({variables: {neuron: {id: this.state.requestedNeuronForDelete.id}}});
                             this.setState({requestedNeuronForDelete: null});
                         }}/>)}
        </DeleteNeuronMutation>;
    }

    public render() {
        return (
            <NeuronsQuery query={NEURONS_QUERY} pollInterval={10000}
                          variables={{input: {offset: this.state.offset, limit: this.state.limit, sortOrder: "DESC"}}}>
                {({loading, error, data}) => {
                    const totalCount = data.neurons ? data.neurons.totalCount : 0;

                    const pageCount = Math.ceil(totalCount / this.state.limit);

                    const activePage = this.state.offset ? (Math.floor(this.state.offset / this.state.limit) + 1) : 1;

                    const start = this.state.offset + 1;
                    const end = Math.min(this.state.offset + this.state.limit, totalCount);

                    return (
                        <div>
                            {this.renderDeleteConfirmationModal()}
                            <Segment.Group>
                                <Segment secondary style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between"
                                }}>
                                    <Header content="Neurons" style={{margin: "0"}}/>
                                    {this.renderCreateNeuron()}
                                </Segment>
                                <Segment>
                                    <PaginationHeader pageCount={pageCount} activePage={activePage}
                                                      limit={this.state.limit}
                                                      onUpdateLimitForPage={this.onUpdateLimit}
                                                      onUpdateOffsetForPage={this.onUpdateOffsetForPage}/>
                                </Segment>
                                <Segment style={{padding: 0}}>
                                    <NeuronsTable neurons={data.neurons ? data.neurons.items : []}
                                                  pageCount={pageCount}
                                                  activePage={activePage}
                                                  onDeleteNeuron={(n) => this.setState({requestedNeuronForDelete: n})}/>
                                </Segment>
                                <Segment secondary>
                                    <Grid columns={3} fluid>
                                        <Grid.Row>
                                            <Grid.Column>
                                                {totalCount >= 0 ? (totalCount > 0 ? `Showing ${start} to ${end} of ${totalCount} neurons` : "It's a clean slate - create the first neurons!") : ""}
                                            </Grid.Column>
                                            <Grid.Column style={{textAlign: "center"}}>
                                                <i>Click a value to edit</i>
                                            </Grid.Column>
                                            <Grid.Column style={{textAlign: "right"}}>
                                                {`Page ${activePage} of ${pageCount}`}
                                            </Grid.Column>
                                        </Grid.Row>
                                    </Grid>
                                </Segment>
                            </Segment.Group>
                        </div>
                    );
                }}
            </NeuronsQuery>
        );
    }
}

function onNeuronCreated(data: CreateNeuronMutationData) {
    if (!data.neuron || data.error) {
        toast.error(toastCreateError(data.error.message), {autoClose: false});
    }
}
