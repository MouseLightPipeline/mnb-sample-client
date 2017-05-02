import {IInjection} from "./injection";
import {displayBrainArea, IBrainArea} from "./brainArea";
import {isNullOrUndefined} from "util";

export interface INeuron {
    id: string;
    idNumber: number;
    idString: string;
    tag: string;
    keywords: string;
    x: number;
    y: number;
    z: number;
    injection: IInjection;
    brainArea: IBrainArea;
}

export function displayNeuron(neuron: INeuron): string {
    const name = neuron ? neuron.idString : "(none)";

    const brainArea = displayNeuronBrainArea(neuron);

    return `${name} (${brainArea})`;
}

export function displayNeuronBrainArea(neuron: INeuron): string {
    return displayBrainArea(neuron.brainArea || (neuron.injection ? neuron.injection.brainArea : null), "(none)", isNullOrUndefined(neuron.brainArea) ? " (inherited)" : "");
}

export function formatSomaCoords(x: number, y: number, z: number) {
    const nx = x ? x.toFixed(4) : "n/a";
    const ny = y ? y.toFixed(4) : "n/a";
    const nz = z ? z.toFixed(4) : "n/a";

    return `(${nx}, ${ny}, ${nz})`;
}

export function formatSomaLocation(neuron: INeuron) {
    if (neuron) {
        return formatSomaCoords(neuron.x, neuron.y, neuron.z);
    } else {
        return "(n/a)";
    }
}
