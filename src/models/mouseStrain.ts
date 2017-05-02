export interface IMouseStrain {
    id: string;
    name: string;
    createdAt?: number;
    updatedAt?: number;
}

export function displayMouseStrain(strain: IMouseStrain) {
    if (!strain || !strain || strain.name.length === 0) {
        return "(none)";
    }

    return strain.name;
}
