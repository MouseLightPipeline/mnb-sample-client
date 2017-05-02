"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function displayBrainArea(brainArea, missing = "(none)", append = "") {
    if (!brainArea || !brainArea.name) {
        return missing;
    }
    return brainArea.name + append;
}
exports.displayBrainArea = displayBrainArea;
//# sourceMappingURL=brainArea.js.map