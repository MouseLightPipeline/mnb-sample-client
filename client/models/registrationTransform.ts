import * as path from "path";

export interface IRegistrationTransform {
    id: string;
    location: string;
    name: string;
    notes: string;
    createdAt?: number;
    updatedAt?: number;
}

export function displayRegistrationTransform(transform: IRegistrationTransform) {
    if (!transform) {
        return "(none)";
    }

    if (transform.name && transform.name.length > 0) {
        return transform.name;
    }

    if (transform.location && transform.location.length > 0) {
        return path.basename(transform.location);
    }

    return ("location not set");
}
