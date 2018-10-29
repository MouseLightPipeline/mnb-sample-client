import {IRegistrationTransform} from "./registrationTransform";
const moment = require("moment");

import {IInjection} from "./injection";

import {displayMouseStrain, IMouseStrain} from "./mouseStrain";

export interface ISample {
    id: string,
    idNumber: number;
    animalId: string;
    tag: string;
    comment: string;
    sampleDate: number;
    sharing: number;
    neuronCount: number;
    mouseStrain: IMouseStrain;
    injections: IInjection[];
    activeRegistrationTransform: IRegistrationTransform;
    registrationTransforms: IRegistrationTransform[];
    createdAt: number;
    updatedAt: number;
}


export interface ISampleInput {
    id: string;
    idNumber?: number;
    animalId?: string;
    tag?: string;
    comment?: string;
    sampleDate?: number;
    sharing?: number;
    mouseStrainId?: string;
    mouseStrainName?: string;
    activeRegistrationTransformId?: string;
}

export interface IMutatedSample {
    sample: ISample;
    error: Error;
}

export interface IMutateSampleData {
    updateSample: IMutatedSample
}

export function displaySample(sample: ISample) {
    if (!sample) {
        return "(none)";
    }

    return `${("000" + sample.idNumber).slice(-4)} (${moment(sample.sampleDate).format("YYYY-MM-DD")})`
}

export function displaySampleAnimal(sample: ISample) {
    const animal = (sample.animalId && sample.animalId.length > 0) ? sample.animalId : "(no animal id)";

    const strain = displayMouseStrain(sample.mouseStrain);

    return animal + "/" + strain;
}