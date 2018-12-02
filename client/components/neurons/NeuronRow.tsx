import * as React from "react";
import {Table, Label, Button, Dropdown} from "semantic-ui-react";
import {toast} from "react-toastify";
import * as moment from "moment";

import {FindVisibilityOption, NeuronVisibilityOptions, ShareVisibility} from "../../models/shareVisibility";
import {formatSomaLocation, INeuron, parseSomaLocation} from "../../models/neuron";
import {displaySample} from "../../models/sample";
import {lookupBrainArea} from "../App";
import {IBrainArea} from "../../models/brainArea";
import {toastCreateError, toastUpdateError} from "../elements/Toasts";
import {DynamicEditField} from "../elements/DynamicEditField";
import {BrainAreaDropdown} from "../editors/BrainAreaDropdown";
import {
    UPDATE_NEURON_MUTATION,
    UpdateNeuronMutation,
    UpdateNeuronMutationData,
    UpdateNeuronMutationFn
} from "../../graphql/neuron";
import {InputPopup} from "../editors/InputPopup";

interface INeuronRowProps {
    neuron: INeuron;
    tracingCount: number;
    onDeleteNeuron(neuron: INeuron): void;
}

export class NeuronRow extends React.Component<INeuronRowProps, {}> {
    private async onAcceptTagEdit(value: string, updateFn: UpdateNeuronMutationFn) {
        if (value !== this.props.neuron.tag) {
            await updateFn({variables: {neuron: {id: this.props.neuron.id, tag: value}}});
        }
    }

    private async onAcceptIdStringEdit(value: string, updateFn: UpdateNeuronMutationFn) {
        if (value !== this.props.neuron.idString) {
            await updateFn({variables: {neuron: {id: this.props.neuron.id, idString: value}}});
        }
    }

    private async onAcceptVisibility(value: ShareVisibility, updateFn: UpdateNeuronMutationFn) {
        if (value !== this.props.neuron.sharing) {
            await updateFn({variables: {neuron: {id: this.props.neuron.id, sharing: value}}});
        }
    }

    private async onAcceptSomaLocationEdit(value: string, updateFn: UpdateNeuronMutationFn) {
        const result = parseSomaLocation(value);

        if (result.error) {
            return;
        }

        await updateFn({variables: {neuron: {id: this.props.neuron.id, x: result.x, y: result.y, z: result.z}}});
    }

    private async onBrainAreaChange(brainArea: IBrainArea, updateFn: UpdateNeuronMutationFn) {
        if (brainArea) {
            if (!this.props.neuron.brainArea || brainArea.id !== this.props.neuron.brainArea.id) {
                await updateFn({variables: {neuron: {id: this.props.neuron.id, brainAreaId: brainArea.id}}});
            }
        } else {
            if (this.props.neuron.brainArea) {
                await updateFn({variables: {neuron: {id: this.props.neuron.id, brainAreaId: null}}});
            }
        }
    }

    public render() {
        const n = this.props.neuron;

        if (!n) {
            return null;
        }

        const count = this.props.tracingCount;

        return (
            <UpdateNeuronMutation mutation={UPDATE_NEURON_MUTATION}
                                  onCompleted={(data) => onNeuronUpdated(data.updateNeuron)}
                                  onError={(error) => toast.error(toastUpdateError(error), {autoClose: false})}>
                {(updateNeuron) => (
                    <Table.Row>
                        <Table.Cell style={{maxWidth: "50px"}}>
                            <InputPopup value={n.idString} placeholder="(none)"
                                        onAccept={v => this.onAcceptIdStringEdit(v, updateNeuron)}/>
                        </Table.Cell>
                        <Table.Cell style={{maxWidth: "50px"}}>
                            <InputPopup value={n.tag} placeholder="(none)"
                                        onAccept={v => this.onAcceptTagEdit(v, updateNeuron)}/>
                        </Table.Cell>
                        <Table.Cell style={{maxWidth: "100px"}}>
                            {displaySample(n.injection.sample)}
                        </Table.Cell>
                        <Table.Cell>
                            <BrainAreaDropdown brainArea={n.brainArea ? lookupBrainArea(n.brainArea.id) : null}
                                               inheritedBrainArea={lookupBrainArea(n.injection.brainArea.id)}
                                               onBrainAreaChange={(brainArea: IBrainArea) => this.onBrainAreaChange(brainArea, updateNeuron)}/>

                        </Table.Cell>
                        <Table.Cell style={{maxWidth: "140px"}}>
                            <InputPopup value={formatSomaLocation(n)} placeholder="(undefined)"
                                        onAccept={v => this.onAcceptSomaLocationEdit(v, updateNeuron)}
                                        isValidValueFcn={v => !parseSomaLocation(v).error}/>
                        </Table.Cell>
                        <Table.Cell style={{width: "110px"}}>
                            <Dropdown search fluid inline options={NeuronVisibilityOptions}
                                      value={FindVisibilityOption(n.sharing).value}
                                      onChange={(e, {value}) => this.onAcceptVisibility(value as ShareVisibility, updateNeuron)}/>
                        </Table.Cell>
                        <Table.Cell style={{maxWidth: "120px"}}>
                            {n.doi}
                        </Table.Cell>
                        <Table.Cell style={{width: "120px"}}>
                            {count !== undefined ? (count === 0 ?
                                <Button icon="trash" color="red" size="mini" content="delete" labelPosition="left"
                                        onClick={() => this.props.onDeleteNeuron(n)}/> :
                                <Label>{count}<Label.Detail>tracings</Label.Detail></Label>) : "?"
                            }
                        </Table.Cell>
                    </Table.Row>
                )}
            </UpdateNeuronMutation>
        );
    }
}

function onNeuronUpdated(data: UpdateNeuronMutationData) {
    if (!data.neuron || data.error) {
        toast.error(toastCreateError(data.error.message), {autoClose: false});
    }
}
