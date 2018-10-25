import * as React from "react";
import {Glyphicon, Modal, Button, ControlLabel, FormGroup} from "react-bootstrap";
import {graphql, InjectedGraphQLProps} from 'react-apollo';
import {toast} from "react-toastify";
import * as moment from "moment";

import {
    FindVisibilityOption,
    IShareVisibilityOption,
    NeuronVisibilityOptions,
    ShareVisibility
} from "../util/ShareVisibility";
import {
    displayNeuron, formatSomaLocation, IMutateNeuronData, INeuron,
    INeuronInput, parseSomaLocation
} from "../models/neuron";
import {DeleteNeuronMutation, UpdateNeuronMutation} from "../graphql/neuron";
import {displaySample} from "../models/sample";
import {BrainAreas, lookupBrainArea} from "./App";
import {IBrainArea} from "../models/brainArea";
import {toastDeleteError, toastDeleteSuccess, toastUpdateError, toastUpdateSuccess} from "./components/Toasts";
import {DynamicEditField, DynamicEditFieldMode} from "./components/DynamicEditField";
import {Dropdown} from "semantic-ui-react";
import {BrainAreaDropdown} from "./editors/BrainAreaDropdown";

const ShareVisibilityOptions = NeuronVisibilityOptions();

const tableCellStyle = {verticalAlign: "middle"};
// const brainAreaTableCellStyle = Object.assign({}, tableCellStyle, {minWidth: "300px"});
// const somaTableCellStyle = Object.assign({}, tableCellStyle, {minWidth: "200px"});
// const editTableCellStyle = Object.assign({}, tableCellStyle, {maxWidth: "150px"});

interface INeuronRowProps {
    neuron: INeuron;
    tracingCount: number;

    updateNeuron?(sample: INeuronInput): Promise<InjectedGraphQLProps<IMutateNeuronData>>;
    deleteNeuron?(sample: INeuronInput): any;
}

interface INeuronRowState {
    isEditingId?: boolean;
    isInUpdate?: boolean;
    showConfirmDelete?: boolean;
    isDeleted?: boolean;
}

@graphql(UpdateNeuronMutation, {
    props: ({mutate}) => ({
        updateNeuron: (neuron: INeuronInput) => mutate({
            variables: {neuron}
        })
    })
})
@graphql(DeleteNeuronMutation, {
    props: ({mutate}) => ({
        deleteNeuron: (neuron: INeuronInput) => mutate({
            variables: {neuron}
        })
    })
})
export class NeuronRow extends React.Component<INeuronRowProps, INeuronRowState> {
    public constructor(props: INeuronRowProps) {
        super(props);

        this.state = {
            isEditingId: false,
            isInUpdate: false,
            showConfirmDelete: false,
            isDeleted: false
        }
    }

    private async performUpdate(samplePartial: INeuronInput) {
        try {
            const result = await this.props.updateNeuron(samplePartial);

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

    private async onAcceptTagEdit(value: string): Promise<boolean> {
        return this.performUpdate({id: this.props.neuron.id, tag: value});
    }

    private async onAcceptIdStringEdit(value: string): Promise<boolean> {
        return this.performUpdate({id: this.props.neuron.id, idString: value});
    }

    private async onAcceptIdNumberEdit(value: string): Promise<boolean> {
        return this.performUpdate({id: this.props.neuron.id, idNumber: parseInt(value)});
    }

    private async onAcceptKeywordsEdit(value: string): Promise<boolean> {
        return this.performUpdate({id: this.props.neuron.id, keywords: value});
    }

    private async onAcceptSomaLocationEdit(value: string): Promise<boolean> {
        const result = parseSomaLocation(value);

        if (result.error) {
            return false;
        }

        return await this.performUpdate({id: this.props.neuron.id, x: result.x, y: result.y, z: result.z});
    }

    private async onAcceptVisibility(value: ShareVisibility): Promise<boolean> {
        if (value !== this.props.neuron.sharing) {
            return this.performUpdate({id: this.props.neuron.id, sharing: value});
        }
    }

    private onBrainAreaChange(brainArea: IBrainArea) {
        if (brainArea) {
            if (!this.props.neuron.brainArea || brainArea.id !== this.props.neuron.brainArea.id) {
                return this.performUpdate({id: this.props.neuron.id, brainAreaId: brainArea.id});
            }
        } else {
            if (this.props.neuron.brainArea) {
                return this.performUpdate({id: this.props.neuron.id, brainAreaId: null});
            }
        }
    }

    private onEditModeChanged(mode: DynamicEditFieldMode) {
        this.setState({isEditingId: mode === DynamicEditFieldMode.Edit});
    }

    private async onShowDeleteConfirmation() {
        this.setState({showConfirmDelete: true}, null);
    }

    private async onCloseConfirmation(shouldDelete = false) {
        this.setState({showConfirmDelete: false}, null);

        if (shouldDelete) {
            await this.deleteNeuron();
        }
    }

    private async deleteNeuron() {
        try {
            const result = await this.props.deleteNeuron({id: this.props.neuron.id});

            if (result.data.deleteNeuron.error) {
                toast.error(toastDeleteError(result.data.deleteNeuron.error), {autoClose: false});
            } else {
                toast.success(toastDeleteSuccess(), {autoClose: 3000});
                this.setState({isDeleted: true});
            }
        } catch (error) {
            toast.error(toastDeleteError(error), {autoClose: false});
        }
    }

    private renderDeleteConfirmationModal() {
        return (
            <Modal show={this.state.showConfirmDelete} onHide={() => this.onCloseConfirmation()}>
                <Modal.Header closeButton>
                    <h4>Delete Sample?</h4>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete the sample {displayNeuron(this.props.neuron)}?
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => this.onCloseConfirmation()} style={{marginRight: "20px"}}>Cancel</Button>
                    <Button onClick={() => this.onCloseConfirmation(true)} bsStyle="danger">Delete</Button>
                </Modal.Footer>
            </Modal>
        );
    }

    public render() {
        const n = this.props.neuron;

        if (!n) {
            return null;
        }

        const count = this.props.tracingCount || "?";

        if (this.state.isDeleted) {
            return null;
        }

        return (
            <tr>
                {this.state.showConfirmDelete ? this.renderDeleteConfirmationModal() : null}
                <td style={tableCellStyle}>
                    <DynamicEditField initialValue={n.idString} placeHolder="(none)"
                                      acceptFunction={v => this.onAcceptIdStringEdit(v)}
                                      onEditModeChanged={(m: DynamicEditFieldMode) => this.onEditModeChanged(m)}/>
                </td>
                <td style={tableCellStyle}>
                    <DynamicEditField initialValue={n.tag} placeHolder="(none)"
                                      acceptFunction={v => this.onAcceptTagEdit(v)}/>
                </td>
                <td style={tableCellStyle}>
                    {displaySample(n.injection.sample)}
                </td>
                <td style={tableCellStyle}>
                    <BrainAreaDropdown brainArea={n.brainArea ? lookupBrainArea(n.brainArea.id) : null}
                                       inheritedBrainArea={lookupBrainArea(n.injection.brainArea.id)}
                                       onBrainAreaChange={(brainArea: IBrainArea) => this.onBrainAreaChange(brainArea)}/>

                </td>
                <td style={tableCellStyle}>
                    <DynamicEditField initialValue={formatSomaLocation(n)} placeHolder="(undefined)"
                                      acceptFunction={v => this.onAcceptSomaLocationEdit(v)}
                                      canAcceptFunction={v => !parseSomaLocation(v).error}
                                      feedbackFunction={v => parseSomaLocation(v).error}/>
                </td>
                <td style={tableCellStyle}>
                    <DynamicEditField initialValue={n.keywords} placeHolder="(none)"
                                      acceptFunction={v => this.onAcceptKeywordsEdit(v)}/>
                </td>
                <td style={tableCellStyle}>
                    <Dropdown search fluid inline options={ShareVisibilityOptions}
                              value={FindVisibilityOption(n.sharing).value}
                              onChange={(e, {value}) => this.onAcceptVisibility(value as ShareVisibility)}/>
                </td>
                <td style={tableCellStyle}>
                    {count}
                </td>
                <td style={tableCellStyle}>
                    {n.doi}
                </td>
                <td style={tableCellStyle}>
                    <div style={{display: "inline-block"}}>
                        {moment(n.createdAt).format("YYYY-MM-DD")}<br/>
                        {moment(n.createdAt).format("hh:mm:ss")}
                    </div>
                    {count === 0 ?
                        <a style={{paddingRight: "20px"}} className="pull-right"
                           onClick={() => this.onShowDeleteConfirmation()}>
                            <Glyphicon glyph="trash"/>
                        </a> : null
                    }
                </td>
            </tr>
        );
    }
}
