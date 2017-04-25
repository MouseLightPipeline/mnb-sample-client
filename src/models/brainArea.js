"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function displayBrainArea(brainArea, missing = "(none)") {
    if (!brainArea || !brainArea.name) {
        return missing;
    }
    return brainArea.name;
}
exports.displayBrainArea = displayBrainArea;
//# sourceMappingURL=brainArea.js.map