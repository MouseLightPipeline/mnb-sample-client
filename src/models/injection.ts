import {displayBrainArea, IBrainArea} from "./brainArea";
import {IFluorophore} from "./fluorophore";
import {IInjectionVirus} from "./injectionVirus";
import {ISample} from "./sample";

export interface IInjection {
    id: string;
    brainArea: IBrainArea;
    injectionVirus: IInjectionVirus;
    fluorophore: IFluorophore;
    sample: ISample;
}

export interface IInjectionInput {
    id: string;
    brainAreaId?: string;
    injectionVirusId?: string;
    injectionVirusName?: string;
    fluorophoreId?: string;
    fluorophoreName?: string;
    sampleId?: string;
}

export function displayInjection(injection: IInjection) {
    if (!injection) {
        return "(none)";
    }

    return displayBrainArea(injection.brainArea, "(no brain area)");
}

export function displayInjections(injections: IInjection[], separator: string = ", ", missing: string = "(none)") {
    if (!injections || injections.length === 0) {
        return missing;
    }

    return injections.reduce((prev, curr) => prev + `${displayInjection(curr)}${separator}`, "").slice(0, -separator.length);
}
