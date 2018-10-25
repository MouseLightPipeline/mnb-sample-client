import * as React from "react";
import {Table, Panel} from "react-bootstrap";
import {graphql, InjectedGraphQLProps} from 'react-apollo';
import {GraphQLDataProps} from "react-apollo/lib/graphql";
import {toast} from "react-toastify";

import {IQueryOutput} from "../util/graphQLTypes";
import {IMutateNeuronData, INeuron, INeuronInput} from "../models/neuron";
import {
    CreateNeuronMutation, DeleteNeuronMutation, NeuronsQuery, TracingForNeuronsCountQuery,
    UpdateNeuronMutation
} from "../graphql/neuron";
import {NeuronRow} from "./NeuronRow";
import {AllSamplesQuery} from "../graphql/sample";
import {displaySample, ISample, ISamplesQueryOutput} from "../models/sample";
import {IInjection} from "../models/injection";
import {UserPreferences} from "../util/userPreferences";
import {toastCreateError, toastCreateSuccess} from "./components/Toasts";
import {PaginationHeader} from "./components/PaginationHeader";
import {Button, Dropdown, Grid} from "semantic-ui-react";
import {InjectionsForSampleDropdown} from "./editors/InjectionForSampleDropdown";

interface ITracingCountsForNeuronsQueryProps {
    tracingCountsForNeurons: any;
}

interface INeuronsGraphQLProps {
    neurons: IQueryOutput<INeuron>;
}

interface ISamplesQueryProps {
    samples: ISamplesQueryOutput;
}

interface INeuronsProps extends InjectedGraphQLProps<INeuronsGraphQLProps> {
    offset: number;
    limit: number;
    samplesQuery?: ISamplesQueryProps & GraphQLDataProps;
    tracingCountsForNeuronsQuery?: ITracingCountsForNeuronsQueryProps & GraphQLDataProps;

    onUpdateOffsetForPage(page: number): void;
    onUpdateLimit(limit: number): void;

    createNeuron?(sample: INeuronInput): any;
    updateNeuron?(neuron: INeuronInput): Promise<InjectedGraphQLProps<IMutateNeuronData>>;
    deleteNeuron?(neuron: INeuronInput): any;
}

interface INeuronState {
    neuronToDelete?: INeuron;
    isInUpdate?: boolean;
    samples?: ISample[];
    sample?: ISample;
    isSampleLocked?: boolean;
    injection: IInjection;
}

@graphql(TracingForNeuronsCountQuery, {
    name: "tracingCountsForNeuronsQuery",
    options: () => ({
        pollInterval: 5000,
        variables: {
            ids: []
        }
    })
})
@graphql(AllSamplesQuery, {
    name: "samplesQuery",
    options: {
        pollInterval: 5000
    }
})
@graphql(NeuronsQuery, {
    options: ({offset, limit}) => ({
        pollInterval: 5000,
        variables: {
            input: {
                offset: offset,
                limit: limit,
                sortOrder: "DESC"
            }
        }
    })
})
@graphql(CreateNeuronMutation, {
    props: ({mutate}) => ({
        createNeuron: (neuron: INeuronInput) => mutate({
            variables: {neuron},
            refetchQueries: ["NeuronsQuery"]
        })
    })
})
@graphql(UpdateNeuronMutation, {
    props: ({mutate}) => ({
        updateNeuron: (neuron: INeuronInput) => mutate({
            variables: {neuron}
        })
    })
}) @graphql(DeleteNeuronMutation, {
    props: ({mutate}) => ({
        deleteNeuron: (neuron: INeuronInput) => mutate({
            variables: {neuron}
        })
    })
})
export class NeuronsTable extends React.Component<INeuronsProps, INeuronState> {
    public constructor(props: INeuronsProps) {
        super(props);

        this.state = {
            neuronToDelete: null,
            isInUpdate: false,
            sample: null,
            samples: [],
            injection: null,
            isSampleLocked: false
        };
    }

    private onSampleChange(sampleId: string) {
        if (!this.state.sample || sampleId !== this.state.sample.id) {
            this.setState({sample: this.state.samples.find(s => s.id === sampleId) || null, injection: null});
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

    private async onCreateNeuron() {
        try {
            const result = await this.props.createNeuron({id: null, injectionId: this.state.injection.id});

            if (!result.data.createNeuron.neuron) {
                toast.error(toastCreateError(result.data.createNeuron.error), {autoClose: false});
            } else {
                toast.success(toastCreateSuccess(), {autoClose: 3000});
            }
        } catch (error) {
            toast.error(toastCreateError(error), {autoClose: false});
        }
    }

    public componentWillReceiveProps(props: INeuronsProps) {
        const lockedSampleId = UserPreferences.Instance.neuronCreateLockedSampleId;

        if (props.samplesQuery && !props.samplesQuery.loading && props.samplesQuery.samples) {
            this.setState({samples: props.samplesQuery.samples.items});

            if (lockedSampleId) {
                let samples = props.samplesQuery.samples.items.filter(s => s.id === lockedSampleId);

                if (samples.length > 0 && this.state.sample !== samples[0]) {
                    this.setState({sample: samples[0], isSampleLocked: true});
                }
            }
        }
    }

    private renderCreateNeuron(samples: ISample[]) {
        const items = samples.map(s => {
            return {value: s.id, text: displaySample(s)}
        });

        return (
            <Grid fluid columns={16}>
                <Grid.Column width={6}/>
                <Grid.Column width={4} textAlign="right">
                    <Button as="div" fluid labelPosition="left">
                        <Dropdown search fluid selection options={items}
                                  className="label"
                                  placeholder="Select sample..."
                                  disabled={this.state.isSampleLocked || samples.length === 0}
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
                            onClick={() => this.onCreateNeuron()}/>
                </Grid.Column> </Grid>
        );
    }

    private renderPanelHeader() {
        return (
            <div>
                <div style={{display: "inline-block"}}>
                    <h4>Neurons</h4>
                </div>
            </div>
        );
    }

    private renderPanelFooter(totalCount: number, activePage: number, pageCount: number) {
        const start = this.props.offset + 1;
        const end = Math.min(this.props.offset + this.props.limit, totalCount);
        return (
            <div>
                <span>
                    {totalCount >= 0 ? (totalCount > 0 ? `Showing ${start} to ${end} of ${totalCount} neurons` : "It's a clean slate - create the first neuron!") : ""}
                </span>
                <span className="pull-right">
                    {`Page ${activePage} of ${pageCount}`}
                </span>
            </div>
        );
    }

    public render() {
        const isDataAvailable = this.props.data && !this.props.data.loading;

        let counts = this.props.tracingCountsForNeuronsQuery && !this.props.tracingCountsForNeuronsQuery.loading ? this.props.tracingCountsForNeuronsQuery.tracingCountsForNeurons.counts : [];

        counts = counts.reduce((prev: any, curr: any) => {
            prev[curr.neuronId] = curr.count;

            return prev;
        }, {});

        const neurons = isDataAvailable ? this.props.data.neurons.items : [];

        const rows = neurons.map(n => {
            return <NeuronRow key={n.id} neuron={n} tracingCount={counts[n.id]}/>
        });

        const totalCount = isDataAvailable ? this.props.data.neurons.totalCount : -1;

        const pageCount = isDataAvailable ? Math.ceil(totalCount / this.props.limit) : 1;

        const activePage = rows ? (this.props.offset ? (Math.floor(this.props.offset / this.props.limit) + 1) : 1) : 0;

        return (
            <Panel bsStyle="default" header={this.renderPanelHeader()}
                   footer={this.renderPanelFooter(totalCount, activePage, pageCount)}>
                {this.renderCreateNeuron(this.state.samples)}
                <div style={{borderBottom: "1px solid #ddd"}}>
                    <PaginationHeader pageCount={pageCount}
                                      activePage={activePage}
                                      limit={this.props.limit}
                                      onUpdateLimitForPage={limit => this.props.onUpdateLimit(limit)}
                                      onUpdateOffsetForPage={page => this.props.onUpdateOffsetForPage(page)}/>
                </div>
                <Table style={{marginBottom: "0px"}}>
                    <thead>
                    <tr>
                        <th>Id</th>
                        <th>Tag</th>
                        <th>Sample</th>
                        <th>Soma Brain Area</th>
                        <th>Soma Sample Location</th>
                        <th>Keywords</th>
                        <th>Visibility</th>
                        <th>Tracings</th>
                        <th>DOI</th>
                        <th>Created</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows}
                    </tbody>
                </Table>
            </Panel>
        );
    }
}
