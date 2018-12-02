import {IInjection} from "./injection";
import {displayBrainArea, IBrainArea} from "./brainArea";
import {isNullOrUndefined} from "../util/nodeUtil";

export interface INeuron {
    id: string;
    idNumber: number;
    idString: string;
    tag: string;
    keywords: string;
    x: number;
    y: number;
    z: number;
    sharing: number;
    doi: string;
    injection: IInjection;
    brainArea: IBrainArea;
    createdAt: number;
    updatedAt: number;
}

export interface IParseSomaResult {
    x: number;
    y: number;
    z: number;
    error: string;
}

export function displayNeuron(neuron: INeuron): string {
    const name = neuron ? neuron.idString : "(none)";

    return name || displayNeuronBrainArea(neuron);
}

export function displayNeuronBrainArea(neuron: INeuron): string {
    return displayBrainArea(neuron.brainArea || (neuron.injection ? neuron.injection.brainArea : null), "(none)", isNullOrUndefined(neuron.brainArea) ? " (inherited)" : "");
}

export function formatSomaCoords(x: number, y: number, z: number) {
    const nx = !isNullOrUndefined(x) ? x.toFixed(2) : "n/a";
    const ny = !isNullOrUndefined(y) ? y.toFixed(2) : "n/a";
    const nz = !isNullOrUndefined(z) ? z.toFixed(2) : "n/a";

    return `(${nx}, ${ny}, ${nz})`;
}

export function formatSomaLocation(neuron: INeuron) {
    if (neuron) {
        return formatSomaCoords(neuron.x, neuron.y, neuron.z);
    } else {
        return "(n/a)";
    }
}

export function parseSomaLocation(location: string): IParseSomaResult {
    location = location.trim();

    if (location.length > 2 && location[0] === "(" && location[location.length - 1] === ")") {
        location = location.slice(1, location.length - 1).trim();
    }

    let parts = location.split(",");

    let somaParse = {
        x: NaN,
        y: NaN,
        z: NaN,
        error: ""
    };

    if (parts.length === 3) {
        somaParse.x = parseFloat(parts[0].trim());
        if (isNaN(somaParse.x)) {
            somaParse.error = "Can not parse soma x location";
            return somaParse;
        }

        somaParse.y = parseFloat(parts[1].trim());
        if (isNaN(somaParse.y)) {
            somaParse.error = "Can not parse soma y location";
            return somaParse;
        }

        somaParse.z = parseFloat(parts[2].trim());
        if (isNaN(somaParse.z)) {
            somaParse.error = "Can not parse soma z location";
            return somaParse;
        }
    } else {
        somaParse.error = "Can not parse soma location";
        return somaParse;
    }

    return somaParse;
}
