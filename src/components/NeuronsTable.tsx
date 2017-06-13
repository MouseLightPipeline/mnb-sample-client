import * as React from "react";
import {Table, Button, Row, Col, InputGroup, Glyphicon} from "react-bootstrap";
import {graphql, InjectedGraphQLProps} from 'react-apollo';
import {GraphQLDataProps} from "react-apollo/lib/graphql";
import {toast} from "react-toastify";
import {isNullOrUndefined} from "util";

import {toastCreateError, toastCreateSuccess} from "./util/Toasts";
import {PaginationHeader} from "./util/PaginationHeader";
import {IQueryOutput} from "../util/graphQLTypes";
import {IMutateNeuronData, INeuron, INeuronInput} from "../models/neuron";
import {
    CreateNeuronMutation, DeleteNeuronMutation, NeuronsQuery, TracingForNeuronsCountQuery,
    UpdateNeuronMutation
} from "../graphql/neuron";
import {NeuronRow} from "./NeuronRow";
import {SampleSelect} from "./editors/SampleSelect";
import {AllSamplesQuery} from "../graphql/sample";
import {ISample, ISamplesQueryOutput} from "../models/sample";
import {IInjection} from "../models/injection";
import {InjectionsForSampleSelect} from "./editors/InjectionForSampleSelect";

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
    sample?: ISample;
    isSampleLocked?: boolean;
    injection: IInjection;
}

@graphql(TracingForNeuronsCountQuery, {
    name: "tracingCountsForNeuronsQuery",
    options: ({sample}) => ({
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
            injection: null,
            isSampleLocked: false
        };
    }

    private onSampleChange(sample: ISample) {
        if (sample !== this.state.sample) {
            this.setState({sample, injection: null}, null);
        }
    }

    private onLockSample() {
        this.setState({isSampleLocked: !this.state.isSampleLocked}, null);

        if (typeof(Storage) !== "undefined") {
            if (!this.state.isSampleLocked) {
                localStorage.setItem("neuron.create.locked.sample", this.state.sample.id);
            } else {
                localStorage.setItem("neuron.create.locked.sample", null);
            }
        }
    }

    private canCreateNeuron(): boolean {
        return !isNullOrUndefined(this.state.sample) && !isNullOrUndefined(this.state.injection);
    }

    private onInjectionChange(injection: IInjection) {
        if (injection !== this.state.injection) {
            this.setState({injection}, null);
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
        if (typeof(Storage) !== "undefined") {
            const lockedSampleId = localStorage.getItem("neuron.create.locked.sample");

            if (lockedSampleId && props.samplesQuery && props.samplesQuery.samples) {
                let samples = props.samplesQuery.samples.items.filter(s => s.id === lockedSampleId);

                if (samples.length > 0 && this.state.sample !== samples[0]) {
                    this.setState({sample: samples[0], isSampleLocked: true}, null);
                }
            }
        }
    }

    private renderPanelHeader(samples: ISample[]) {
        return (
            <div className="card-header">
                <div style={{display: "inline-block"}}>
                    <h5>Neurons</h5>
                </div>
                <div style={{display: "inline-block", paddingTop: "px", maxWidth: "720px"}}
                     className="pull-right">
                    <Row style={{margin: "0px"}}>
                        <Col md={4} sm={12}>
                            <InputGroup bsSize="sm">
                                <SampleSelect idName="create-neuron-samples" options={samples}
                                              selectedOption={this.state.sample}
                                              disabled={this.state.isSampleLocked}
                                              placeholder="Select sample..."
                                              onSelect={s => this.onSampleChange(s)}/>
                                <InputGroup.Button>
                                    <Button bsStyle={this.state.isSampleLocked ? "danger" : "default"}
                                            disabled={this.state.sample === null}
                                            active={this.state.isSampleLocked}
                                            onClick={() => this.onLockSample()}>
                                        <Glyphicon glyph="lock"/>
                                    </Button>
                                </InputGroup.Button>
                            </InputGroup>
                        </Col>
                        <Col md={7} sm={12}>
                            <InjectionsForSampleSelect sample={this.state.sample}
                                                       selectedInjection={this.state.injection}
                                                       onInjectionChange={n => this.onInjectionChange(n)}
                                                       disabled={this.state.sample === null}
                                                       placeholder={this.state.sample ? "Select an injection..." : "No sample..."}/>
                        </Col>
                        <Col md={1} sm={12}>
                            <Button bsSize="sm" bsStyle="primary" disabled={!this.canCreateNeuron()}
                                    onClick={() => this.onCreateNeuron()}>
                                <Glyphicon glyph="plus"/>
                            </Button>
                        </Col>
                    </Row>
                </div>
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

        const samples = this.props.samplesQuery && !this.props.samplesQuery.loading ? this.props.samplesQuery.samples.items : [];

        return (
            <div className="card">
                {this.renderPanelHeader(samples)}
                <div className="card-block">
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
                            <th>Created</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows}
                        </tbody>
                    </Table>
                    <div className="card-footer">
                        {totalCount >= 0 ? (totalCount > 0 ? `${totalCount} neurons` : "It's a clean slate - create the first neuron!") : ""}
                    </div>
                </div>
            </div>
        );
    }
}
