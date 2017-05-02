"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const brainArea_1 = require("./brainArea");
function displayInjection(injection) {
    if (!injection) {
        return "(none)";
    }
    return brainArea_1.displayBrainArea(injection.brainArea, "(no brain area)");
}
exports.displayInjection = displayInjection;
function displayInjections(injections, separator = ", ", missing = "(none)") {
    if (!injections || injections.length === 0) {
        return missing;
    }
    return injections.reduce((prev, curr) => prev + `${displayInjection(curr)}${separator}`, "").slice(0, -separator.length);
}
exports.displayInjections = displayInjections;
//# sourceMappingURL=injection.js.map