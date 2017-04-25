"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const brainArea_1 = require("./brainArea");
function displayNeuron(neuron) {
    const name = neuron ? neuron.idString : "(none)";
    const brainArea = brainArea_1.displayBrainArea(neuron.brainArea || (neuron.injection ? neuron.injection.brainArea : null));
    return `${name} (${brainArea})`;
}
exports.displayNeuron = displayNeuron;
//# sourceMappingURL=neuron.js.map