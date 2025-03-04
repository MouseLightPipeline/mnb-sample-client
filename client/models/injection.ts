import {displayBrainArea, IBrainArea} from "./brainArea";
import {IFluorophore} from "./fluorophore";
import {IInjectionVirus} from "./injectionVirus";
import {INeuron} from "./neuron";
import {ISample} from "./sample";

export interface IInjection {
    id: string;
    brainArea: IBrainArea;
    injectionVirus: IInjectionVirus;
    fluorophore: IFluorophore;
    neurons: INeuron[];
    sample?: ISample;
}

export function displayInjection(injection: IInjection, truncate: number = 0) {
    if (!injection) {
        return "(none)";
    }

    const str = displayBrainArea(injection.brainArea, "(no brain area)");

    if (truncate > 0 && str.length > truncate + 3) {
        return str.substring(0, truncate) + "...";
    }

    return str;
}

export function displayInjections(injections: IInjection[], separator: string = ", ", missing: string = "(none)") {
    if (!injections || injections.length === 0) {
        return missing;
    }

    return injections.reduce((prev, curr) => prev + `${displayInjection(curr)}${separator}`, "").slice(0, -separator.length);
}

export function displayInjectionWithVirus(injection: IInjection) {
    if (!injection) {
        return "(none)";
    }

    const b = displayBrainArea(injection.brainArea, "(no brain area)")
    const i = injection.injectionVirus ? ` (${injection.injectionVirus.name})` : "";

    return b + i;
}
