import * as React from "react";
import {Table, Glyphicon, Modal, Button} from "react-bootstrap";
import {graphql, InjectedGraphQLProps} from 'react-apollo';
import {toast} from "react-toastify";
import * as moment from "moment";

import {PaginationHeader} from "./util/PaginationHeader";
import {IQueryOutput} from "../util/graphQLTypes";
import {
    displayNeuron, displayNeuronBrainArea, formatSomaLocation, IMutateNeuronData, INeuron,
    INeuronInput
} from "../models/neuron";
import {displaySample} from "../models/sample";
import {truncate} from "../util/string";
import {toastDeleteError, toastDeleteSuccess, toastUpdateError, toastUpdateSuccess} from "./util/Toasts";
import {DeleteNeuronMutation, NeuronsQuery, UpdateNeuronMutation} from "../graphql/neuron";
import {FindVisibilityOption, IShareVisibilityOption, NeuronVisibilityOptions} from "../util/ShareVisibility";
import {VisibilitySelect} from "./editors/VisibilitySelect";

const ShareVisibilityOptions = NeuronVisibilityOptions();

interface INeuronsGraphQLProps {
    neurons: IQueryOutput<INeuron>;
}

interface INeuronsProps extends InjectedGraphQLProps<INeuronsGraphQLProps> {
    offset: number;
    limit: number;

    onUpdateOffsetForPage(page: number): void;
    onUpdateLimit(limit: number): void;

    updateNeuron?(neuron: INeuronInput): Promise<InjectedGraphQLProps<IMutateNeuronData>>;
    deleteNeuron?(neuron: INeuronInput): any;
}

interface INeuronState {
    showConfirmDelete?: boolean;
    neuronToDelete?: INeuron;
    isInUpdate?: boolean;
}

@graphql(NeuronsQuery, {
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
@graphql(UpdateNeuronMutation, {
    props: ({mutate}) => ({
        updateNeuron: (neuron: INeuronInput) => mutate({
            variables: {neuron}
        })
    })
})@graphql(DeleteNeuronMutation, {
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
            showConfirmDelete: false, neuronToDelete: null,
            isInUpdate: false
        };
    }

    private async performUpdate(neuronPartial: INeuronInput) {
        try {
            const result = await this.props.updateNeuron(neuronPartial);

            if (!result.data.updateNeuron.neuron) {
                toast.error(toastUpdateError(result.data.updateNeuron.error), {autoClose: false});
            } else {
                toast.success(toastUpdateSuccess(), {autoClose: 3000});
            }
            this.setState({isInUpdate: false});
        } catch (error) {
            toast.error(toastUpdateError(error), {autoClose: false});

            this.setState({isInUpdate: false});

            return false;
        }

        return true;
    }

    private async onAcceptVisibility(neuron: INeuron, visibility: IShareVisibilityOption): Promise<boolean> {
        return this.performUpdate({id: neuron.id, sharing: visibility.id});
    }

    private async onShowDeleteConfirmation(neuron: INeuron) {
        this.setState({showConfirmDelete: true, neuronToDelete: neuron}, null);
    }


    private async onCloseConfirmation(shouldDelete = false) {
        this.setState({showConfirmDelete: false}, null);

        if (shouldDelete) {
            await this.deleteNeuron();
        }
    }

    private async deleteNeuron() {
        try {
            const result = await this.props.deleteNeuron({id: this.state.neuronToDelete.id});

            console.log(result);
            if (result.data.deleteNeuron.error) {
                toast.error(toastDeleteError(result.data.deleteNeuron.error), {autoClose: false});
            } else {
                toast.success(toastDeleteSuccess(), {autoClose: 3000});
                // this.setState({isDeleted: true});
            }
        } catch (error) {
            toast.error(toastDeleteError(error), {autoClose: false});
        }
    }

    private renderDeleteConfirmationModal() {
        return (
            <Modal show={this.state.showConfirmDelete} onHide={() => this.onCloseConfirmation()}>
                <Modal.Header closeButton>
                    <h4>Delete Neuron?</h4>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete neuron {displayNeuron(this.state.neuronToDelete)}?
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => this.onCloseConfirmation()} style={{marginRight: "20px"}}>Cancel</Button>
                    <Button onClick={() => this.onCloseConfirmation(true)} bsStyle="danger">Delete</Button>
                </Modal.Footer>
            </Modal>
        );
    }

    public render() {
        const isDataAvailable = this.props.data && !this.props.data.loading;

        const neurons = isDataAvailable ? this.props.data.neurons.items : [];

        const rows = neurons.map(n => {
            return (<tr key={n.id}>
                <td>{n.idString}</td>
                <td>{n.tag}</td>
                <td>{displaySample(n.injection.sample)}</td>
                <td>{displayNeuronBrainArea(n)}</td>
                <td>{formatSomaLocation(n)}</td>
                <td>{truncate(n.keywords)}</td>
                <td>
                    <VisibilitySelect idName="sample-visibility"
                                      options={ShareVisibilityOptions}
                                      selectedOption={FindVisibilityOption(n.sharing)}
                                      isDeferredEditMode={true}
                                      isExclusiveEditMode={false}
                                      onSelect={v => this.onAcceptVisibility(n, v)}/>
                </td>
                <td>
                    <div style={{display: "inline-block"}}>
                        {moment(n.createdAt).format("YYYY-MM-DD")}<br/>
                        {moment(n.createdAt).format("hh:mm:ss")}
                    </div>
                    <a style={{paddingRight: "20px"}} className="pull-right"
                       onClick={() => this.onShowDeleteConfirmation(n)}>
                        <Glyphicon glyph="trash"/>
                    </a>
                </td>
            </tr>)
        });

        const totalCount = isDataAvailable ? this.props.data.neurons.totalCount : -1;

        const pageCount = isDataAvailable ? Math.ceil(totalCount / this.props.limit) : 1;

        const activePage = rows ? (this.props.offset ? (Math.floor(this.props.offset / this.props.limit) + 1) : 1) : 0;

        return (
            <div className="card">
                {this.state.showConfirmDelete ? this.renderDeleteConfirmationModal() : null}
                <div className="card-header">
                    Neurons
                </div>
                <div className="card-block">
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
                            <th>Sample</th>
                            <th>Soma Brain Area</th>
                            <th>Soma Sample Location</th>
                            <th>Keywords</th>
                            <th>Visibility</th>
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
