import * as React from "react";
import {Glyphicon, Modal, Button} from "react-bootstrap";
import {graphql, InjectedGraphQLProps} from 'react-apollo';
import {toast} from "react-toastify";
import * as moment  from "moment";

import {FindVisibilityOption, IShareVisibilityOption, NeuronVisibilityOptions} from "../util/ShareVisibility";
import {
    displayNeuron, formatSomaLocation, IMutateNeuronData, INeuron,
    INeuronInput, parseSomaLocation
} from "../models/neuron";
import {DeleteNeuronMutation, UpdateNeuronMutation} from "../graphql/neuron";
import {VisibilitySelect} from "./editors/VisibilitySelect";
import {displaySample} from "../models/sample";
import {BrainAreaSelect} from "./editors/BrainAreaSelect";
import {BrainAreas, lookupBrainArea} from "./App";
import {IBrainArea} from "../models/brainArea";
import {
    DynamicEditField, toastUpdateSuccess, toastUpdateError, toastDeleteSuccess, toastDeleteError,
    DynamicEditFieldMode
} from "ndb-react-components";

const ShareVisibilityOptions = NeuronVisibilityOptions();

const tableCellStyle = {verticalAlign: "middle"};
const brainAreaTableCellStyle = Object.assign({}, tableCellStyle, {minWidth: "300px"});
const somaTableCellStyle = Object.assign({}, tableCellStyle, {minWidth: "200px"});
const editTableCellStyle = Object.assign({}, tableCellStyle, {maxWidth: "150px"});


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

        console.log(result);

        return false;
        // return this.performUpdate({id: this.props.neuron.id, x: parseInt(value), y: parseInt(value), z: parseInt(value)});
    }

    private async onAcceptVisibility(visibility: IShareVisibilityOption): Promise<boolean> {
        return this.performUpdate({id: this.props.neuron.id, sharing: visibility.id});
    }

    private onBrainAreaChange(brainArea: IBrainArea) {
        const id = brainArea && brainArea.id.length > 0 ? brainArea.id : null;

        return this.performUpdate({id: this.props.neuron.id, brainAreaId: id});
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

        const count = this.props.tracingCount || 0;

        if (this.state.isDeleted) {
            return null;
        }

        return (
            <tr>
                {this.state.showConfirmDelete ? this.renderDeleteConfirmationModal() : null}
                <td style={editTableCellStyle}>
                    <DynamicEditField initialValue={n.idString} placeHolder="(none)"
                                      acceptFunction={v => this.onAcceptIdStringEdit(v)}
                                      onEditModeChanged={(m: DynamicEditFieldMode) => this.onEditModeChanged(m)}/>
                </td>
                <td style={editTableCellStyle}>
                    <DynamicEditField initialValue={n.tag} placeHolder="(none)"
                                      acceptFunction={v => this.onAcceptTagEdit(v)}/>
                </td>
                <td style={tableCellStyle}>
                    {displaySample(n.injection.sample)}
                </td>
                <td style={brainAreaTableCellStyle}>
                    <BrainAreaSelect idName="brain-area"
                                     options={BrainAreas}
                                     selectedOption={n.brainArea ? lookupBrainArea(n.brainArea.id) : null}
                                     userData={lookupBrainArea(n.injection.brainArea.id)}
                                     multiSelect={false}
                                     isDeferredEditMode={true}
                                     isExclusiveEditMode={false}
                                     placeholder="select..."
                                     onSelect={(brainArea: IBrainArea) => this.onBrainAreaChange(brainArea)}/>

                </td>
                <td style={somaTableCellStyle}>
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
                    <VisibilitySelect idName="neuron-visibility"
                                      options={ShareVisibilityOptions}
                                      selectedOption={FindVisibilityOption(n.sharing)}
                                      isDeferredEditMode={true}
                                      isExclusiveEditMode={false}
                                      onSelect={s => this.onAcceptVisibility(s)}/>
                </td>
                <td style={tableCellStyle}>
                    {count}
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
