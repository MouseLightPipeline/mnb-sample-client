import {INamedModel} from "./namedModel";

export interface IMouseStrain extends INamedModel {
    id: string;
    createdAt?: number;
    updatedAt?: number;
}

export function displayMouseStrain(strain: IMouseStrain) {
    if (!strain || !strain || strain.name.length === 0) {
        return "(none)";
    }

    return strain.name;
}
