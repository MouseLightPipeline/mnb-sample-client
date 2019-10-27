export interface IBrainArea {
    id: string;
    name: string;
    structureId?: number;
    depth?: number;
    parentStructureId?: number;
    structureIdPath?: string;
    safeName?: string;
    acronym?: string;
    aliasList?: string[];
    atlasId?: number;
    graphId?: number;
    graphOrder?: number;
    hemisphereId?: number;
    geometryFile?: string;
    geometryColor?: string;
    geometryEnable?: boolean;
    createdAt?: number;
    updatedAt?: number;
}

export function displayBrainArea(brainArea: IBrainArea, missing = "(none)", append = "") {
    if (!brainArea || !brainArea.name) {
        return missing;
    }
    return brainArea.name + append;
}
