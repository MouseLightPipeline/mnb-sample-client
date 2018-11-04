import * as React from "react";
import {Button, Dropdown, Segment, Grid, Confirm} from "semantic-ui-react";
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

        this.state = {
            offset: UserPreferences.Instance.neuronPageOffset,
            limit: UserPreferences.Instance.neuronPageLimit,
            sample: null,
            injection: null,
            isSampleLocked: false
        }
    }

    private onUpdateOffsetForPage = (page: number) => {
        const offset = this.state.limit * (page - 1);

        if (offset != this.state.offset) {
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
                    <Grid fluid="true" columns={16} floated="right">
                        <Grid.Column width={6}/>
                        <Grid.Column width={4} textAlign="right">
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
                        </Grid.Column>

                        <Grid.Column width={4} textAlign="left">
                            <InjectionsForSampleDropdown sample={this.state.sample}
                                                         selectedInjection={this.state.injection}
                                                         onInjectionChange={n => this.onInjectionChange(n)}
                                                         disabled={this.state.sample === null}/>
                        </Grid.Column>

                        <Grid.Column width={2} textAlign="right">
                            <Button content="Add" icon="add" labelPosition="right" color="blue"
                                    disabled={this.state.injection === null}
                                    onClick={() => createNeuron({variables: {neuron: {injectionId: this.state.injection.id}}})}/>
                        </Grid.Column>
                    </Grid>
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

                    return (
                        <div>
                            {this.renderDeleteConfirmationModal()}
                            <Segment attached="top" secondary clearing style={{borderBottomWidth: 0}}>
                                <h3 style={{display: "inline-block", verticalAlign: "middle"}}>Neurons</h3>
                                {this.renderCreateNeuron()}
                            </Segment>
                            <Segment attached secondary style={{borderBottomWidth: 0}}>
                                <PaginationHeader pageCount={pageCount} activePage={activePage} limit={this.state.limit}
                                                  onUpdateLimitForPage={this.onUpdateLimit}
                                                  onUpdateOffsetForPage={this.onUpdateOffsetForPage}/>
                            </Segment>
                            <NeuronsTable neurons={data.neurons ? data.neurons.items : []} offset={this.state.offset}
                                          limit={this.state.limit} totalCount={totalCount} pageCount={pageCount}
                                          activePage={activePage}
                                          onDeleteNeuron={(n) => this.setState({requestedNeuronForDelete: n})}/>
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
