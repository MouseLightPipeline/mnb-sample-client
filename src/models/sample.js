"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const mouseStrain_1 = require("./mouseStrain");
function displaySample(sample) {
    if (!sample) {
        return "(none)";
    }
    return `${("000" + sample.idNumber).slice(-4)} (${moment(sample.sampleDate).format("YYYY-MM-DD")})`;
}
exports.displaySample = displaySample;
function displaySampleAnimal(sample) {
    const animal = (sample.animalId && sample.animalId.length > 0) ? sample.animalId : "(no animal id)";
    const strain = mouseStrain_1.displayMouseStrain(sample.mouseStrain);
    return animal + "/" + strain;
}
exports.displaySampleAnimal = displaySampleAnimal;
//# sourceMappingURL=sample.js.map