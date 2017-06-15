import * as React from "react";
import {Table, Button, Glyphicon, Panel} from "react-bootstrap";
import {graphql, InjectedGraphQLProps} from 'react-apollo';
import {toast} from "react-toastify";
import {GraphQLDataProps} from "react-apollo/lib/graphql";

import {IQueryOutput} from "../util/graphQLTypes";
import {ISample, ISampleInput} from "../models/sample";
import {SampleRow} from "./SampleRow";
import {IMouseStrain} from "../models/mouseStrain";
import {ManageTransforms} from "./dialogs/RegistrationTransform/ManageTransforms";
import {ManageInjections} from "./dialogs/Injection/ManageInjections";
import {CreateSampleMutation, NeuronCountsForSamplesQuery, SamplesQuery} from "../graphql/sample";
import {PaginationHeader, toastCreateError, toastCreateSuccess} from "ndb-react-components";

interface ISamplesGraphQLProps {
    samples: IQueryOutput<ISample>;
}

interface INeuronsForSamplesQueryProps {
    neuronCountsForSamples: any;
}

interface ISamplesProps extends InjectedGraphQLProps<ISamplesGraphQLProps> {
    mouseStrains: IMouseStrain[];

    offset: number;
    limit: number;

    neuronCountsForSamplesQuery?: INeuronsForSamplesQueryProps & GraphQLDataProps;

    onUpdateOffsetForPage(page: number): void;
    onUpdateLimit(limit: number): void;

    createSample?(sample: ISampleInput): any;
}

interface ISamplesState {
    isTransformDialogShown?: boolean;
    manageTransformsSample?: ISample;
    isInjectionDialogShown?: boolean;
    manageInjectionsSample?: ISample;
}

@graphql(SamplesQuery, {
    options: ({offset, limit}) => ({
        pollInterval: 5000,
        variables: {
            input: {
                offset: offset,
                limit: limit
            }
        }
    })
})
@graphql(CreateSampleMutation, {
    props: ({mutate}) => ({
        createSample: (sample: ISampleInput) => mutate({
            variables: {sample},
            refetchQueries: ["Samples"]
        })
    })
})
@graphql(NeuronCountsForSamplesQuery, {
    name: "neuronCountsForSamplesQuery",
    options: ({sample}) => ({
        pollInterval: 5000,
        variables: {
            ids: []
        }
    })
})
export class SamplesTable extends React.Component<ISamplesProps, ISamplesState> {
    public constructor(props: ISamplesProps) {
        super(props);

        this.state = {
            isTransformDialogShown: false,
            manageTransformsSample: null,
            isInjectionDialogShown: false,
            manageInjectionsSample: null
        }
    }

    private async onCreateSample() {
        try {
            const result = await this.props.createSample({id: null});

            if (!result.data.createSample.sample) {
                toast.error(toastCreateError(result.data.createSample.error), {autoClose: false});
            } else {
                toast.success(toastCreateSuccess(), {autoClose: 3000});
            }
        } catch (error) {
            toast.error(toastCreateError(error), {autoClose: false});
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
                <ManageTransforms sampleId={this.state.manageTransformsSample.id}
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
                <ManageInjections sampleId={this.state.manageInjectionsSample.id}
                                  show={this.state.isInjectionDialogShown}
                                  onClose={() => this.setState({isInjectionDialogShown: false})}/>
            );
        } else {
            return null;
        }
    }

    private renderPanelFooter(totalCount: number, activePage: number, pageCount: number) {
        const start = this.props.offset + 1;
        const end = Math.min(this.props.offset + this.props.limit, totalCount);
        return (
            <div>
                <span>
                    {totalCount >= 0 ? (totalCount > 0 ? `Showing ${start} to ${end} of ${totalCount} samples` : "It's a clean slate - create the first sample!") : ""}
                </span>
                <span className="pull-right">
                    {`Page ${activePage} of ${pageCount}`}
                </span>
            </div>
        );
    }

    private renderHeader() {
        return (
            <div>
                <div style={{display: "inline-block"}}>
                    <h4>Samples</h4>
                </div>
                <div className="pull-right">
                   <Button bsSize="sm" bsStyle="primary" onClick={() => this.onCreateSample()}>
                        <Glyphicon glyph="plus"/>
                    </Button>
                </div>
            </div>
        );
    }

    public render() {
        const isDataAvailable = this.props.data && !this.props.data.loading;

        const samples = isDataAvailable ? this.props.data.samples.items : [];

        const totalCount = isDataAvailable ? this.props.data.samples.totalCount : -1;

        const pageCount = isDataAvailable ? Math.ceil(totalCount / this.props.limit) : 1;

        const activePage = isDataAvailable ? (this.props.offset ? (Math.floor(this.props.offset / this.props.limit) + 1) : 1) : 0;

        let counts = this.props.neuronCountsForSamplesQuery && !this.props.neuronCountsForSamplesQuery.loading ? this.props.neuronCountsForSamplesQuery.neuronCountsForSamples.counts : [];

        counts = counts.reduce((prev: any, curr: any) => {
            prev[curr.sampleId] = curr.count;

            return prev;
        }, {});

        const rows = samples.map(s => {
            return <SampleRow key={`sl_${s.id}`} sample={s} mouseStrains={this.props.mouseStrains}
                              neuronCount={counts[s.id]}
                              onRequestAddRegistrationTransform={(s) => this.onRequestAddRegistrationTransform(s)}
                              onRequestManageInjections={(s) => this.onRequestManageInjections(s)}/>
        });

        return (
            <Panel bsStyle="default" header={this.renderHeader()}
                   footer={this.renderPanelFooter(totalCount, activePage, pageCount)}>
                <PaginationHeader pageCount={pageCount}
                                  activePage={activePage}
                                  limit={this.props.limit}
                                  onUpdateLimitForPage={limit => this.props.onUpdateLimit(limit)}
                                  onUpdateOffsetForPage={page => this.props.onUpdateOffsetForPage(page)}/>
                <Table style={{marginBottom: "0px"}}>
                    <thead>
                    <tr>
                        <th>Id</th>
                        <th>Tag</th>
                        <th>Animal Id</th>
                        <th>Acq. Date</th>
                        <th>Strain</th>
                        <th>Registrations</th>
                        <th>Injections</th>
                        <th>Comment</th>
                        <th>Visibility</th>
                        <th>Neurons</th>
                        <th>Created</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows}
                    </tbody>
                </Table>
                {this.renderTransformsDialog()}
                {this.renderInjectionsDialog()}
            </Panel>
        );
    }
}
