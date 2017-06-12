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
    const nx = !util_1.isNullOrUndefined(x) ? x.toFixed(4) : "n/a";
    const ny = !util_1.isNullOrUndefined(y) ? y.toFixed(4) : "n/a";
    const nz = !util_1.isNullOrUndefined(z) ? z.toFixed(4) : "n/a";
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
function parseSomaLocation(location) {
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
    }
    else {
        somaParse.error = "Can not parse soma location";
        return somaParse;
    }
    return somaParse;
}
exports.parseSomaLocation = parseSomaLocation;
//# sourceMappingURL=neuron.js.map