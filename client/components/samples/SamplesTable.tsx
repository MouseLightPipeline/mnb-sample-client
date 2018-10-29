import * as React from "react";
import {toast} from "react-toastify";
import {Button, Table, Header, Segment} from "semantic-ui-react";

// import {IMouseStrain} from "../models/mouseStrain";
// import {ManageTransforms} from "./dialogs/RegistrationTransform/ManageTransforms";
// import {ManageInjections} from "./dialogs/Injection/ManageInjections";
// import {toastCreateError, toastCreateSuccess} from "./components/Toasts";
// import {PaginationHeader} from "./components/PaginationHeader";
import {ISample} from "../../models/sample";
import {IMouseStrain} from "../../models/mouseStrain";
import {SampleRow} from "./SampleRow";
import {PaginationHeader} from "../elements/PaginationHeader";

interface ISamplesProps {
    samples: ISample[];
    mouseStrainList: IMouseStrain[];

    offset: number;
    limit: number;

    // neuronCountsForSamplesQuery?: INeuronsForSamplesQueryProps & GraphQLDataProps;

    onUpdateOffsetForPage(page: number): void;
    onUpdateLimit(limit: number): void;

    // createSample?(sample: ISampleInput): any;
}

interface ISamplesState {
    isTransformDialogShown?: boolean;
    manageTransformsSample?: ISample;
    isInjectionDialogShown?: boolean;
    manageInjectionsSample?: ISample;
}

/*
@graphql(SamplesQuery, {
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
    options: () => ({
        pollInterval: 5000,
        variables: {
            ids: []
        }
    })
})
*/
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
        /*
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
        */
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
        /*
        if (this.state.manageTransformsSample && this.state.isTransformDialogShown) {
            return (
                <ManageTransforms sampleId={this.state.manageTransformsSample.id}
                                  show={this.state.isTransformDialogShown}
                                  onClose={() => this.setState({isTransformDialogShown: false})}/>
            );
        } else {
            return null;
        }
        */
        return null as any;
    }

    private renderInjectionsDialog() {
        /*
        if (this.state.manageInjectionsSample && this.state.isInjectionDialogShown) {
            return (
                <ManageInjections sampleId={this.state.manageInjectionsSample.id}
                                  show={this.state.isInjectionDialogShown}
                                  onClose={() => this.setState({isInjectionDialogShown: false})}/>
            );
        } else {
            return null;
        }
        */
        return null as any;
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
                <div style={{display: "inline-block", verticalAlign: "middle"}}>
                    <h4>Samples</h4>
                </div>
                <div className="pull-right">

                    <Button content="Add" icon="add" labelPosition="right" color="blue"
                            onClick={() => this.onCreateSample()}/>
                </div>
            </div>
        );
    }

    public render() {
        const samples = this.props.samples.slice(this.props.offset, this.props.offset + this.props.limit);

        const totalCount = this.props.samples.length;

        const pageCount = Math.ceil(totalCount / this.props.limit);

        const activePage = (this.props.offset ? (Math.floor(this.props.offset / this.props.limit) + 1) : 1);

        /*
        let counts = this.props.neuronCountsForSamplesQuery && !this.props.neuronCountsForSamplesQuery.loading ? this.props.neuronCountsForSamplesQuery.neuronCountsForSamples.counts : [];

        counts = counts.reduce((prev: any, curr: any) => {
            prev[curr.sampleId] = curr.count;

            return prev;
        }, {});
*/

        const rows = samples.map(s => {
            return <SampleRow key={`sl_${s.id}`} sample={s} mouseStrains={this.props.mouseStrainList}
                              neuronCount={/*counts[s.id]*/0}
                              onRequestAddRegistrationTransform={(s) => this.onRequestAddRegistrationTransform(s)}
                              onRequestManageInjections={(s) => this.onRequestManageInjections(s)}/>
        });

        return (
            <div>
                <Segment attached="top" secondary clearing style={{borderBottomWidth: 0}}>
                    {this.renderHeader()}
                </Segment>
                <Segment attached secondary style={{borderBottomWidth: 0}}>
                    <PaginationHeader pageCount={pageCount}
                                      activePage={activePage}
                                      limit={this.props.limit}
                                      onUpdateLimitForPage={limit => this.props.onUpdateLimit(limit)}
                                      onUpdateOffsetForPage={page => this.props.onUpdateOffsetForPage(page)}/>
                </Segment>
                <Table attached="bottom" compact="very">
                    <Table.Body>
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
                            <Table.HeaderCell>Neurons</Table.HeaderCell>
                            <Table.HeaderCell>Created</Table.HeaderCell>
                        </Table.Row>
                        {rows}
                    </Table.Body>
                    <Table.Footer fullwidth="true">
                        <Table.Row>
                            <Table.HeaderCell colSpan={11}>
                                {this.renderPanelFooter(totalCount, activePage, pageCount)}
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Footer>
                </Table>
                {this.renderTransformsDialog()}
                {this.renderInjectionsDialog()}
            </div>
        );
    }
}
