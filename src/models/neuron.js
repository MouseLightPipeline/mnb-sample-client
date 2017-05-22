"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const brainArea_1 = require("./brainArea");
const util_1 = require("util");
function displayNeuron(neuron) {
    const name = neuron ? neuron.idString : "(none)";
    return name || displayNeuronBrainArea(neuron);
}
exports.displayNeuron = displayNeuron;
function displayNeuronBrainArea(neuron) {
    return brainArea_1.displayBrainArea(neuron.brainArea || (neuron.injection ? neuron.injection.brainArea : null), "(none)", util_1.isNullOrUndefined(neuron.brainArea) ? " (inherited)" : "");
}
exports.displayNeuronBrainArea = displayNeuronBrainArea;
function formatSomaCoords(x, y, z) {
    const nx = x ? x.toFixed(4) : "n/a";
    const ny = y ? y.toFixed(4) : "n/a";
    const nz = z ? z.toFixed(4) : "n/a";
    return `(${nx}, ${ny}, ${nz})`;
}
exports.formatSomaCoords = formatSomaCoords;
function formatSomaLocation(neuron) {
    if (neuron) {
        return formatSomaCoords(neuron.x, neuron.y, neuron.z);
    }
    else {
        return "(n/a)";
    }
}
exports.formatSomaLocation = formatSomaLocation;
//# sourceMappingURL=neuron.js.map