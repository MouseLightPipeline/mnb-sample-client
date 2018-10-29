import gql from "graphql-tag";
import {Mutation, Query} from "react-apollo";

import {IBrainArea} from "../models/brainArea";

export const COMPARTMENT_FIELDS_FRAGMENT = gql`fragment CompartmentFields on BrainArea {
    id
    name
    structureId
    depth
    parentStructureId
    structureIdPath
    safeName
    acronym
    aliases
    atlasId
    graphId
    graphOrder
    hemisphereId
    geometryFile
    geometryColor
    geometryEnable
    createdAt
    updatedAt
}`;

export const COMPARTMENTS_QUERY = gql`query {
    brainAreas {
        ...CompartmentFields
    }
}
${COMPARTMENT_FIELDS_FRAGMENT}
`;

type CompartmentsQueryResponse = {
    brainAreas: IBrainArea[];
}

export class CompartmentsQuery extends Query<CompartmentsQueryResponse, {}> {
}

///
/// Update Brain Area (aliases)
///

export const UPDATE_COMPARTMENT_MUTATION = gql`mutation UpdateBrainArea($brainArea: BrainAreaInput) {
    updateBrainArea(brainArea: $brainArea) {
        brainArea {
            id
            aliases
            updatedAt
        }
        error {
            message
        }
    }
}`;

type UpdateCompartmentVariables = {
    brainArea: {
        id: string;
        aliases: string[];
    }
}

type UpdateCompartmentMutationData = {
    brainArea: IBrainArea;
    error: {
        message: string;
    }
}

type UpdateCompartmentMutationResponse = {
    updateBrainArea: UpdateCompartmentMutationData;
}

export class UpdateCompartmentMutation extends Mutation<UpdateCompartmentMutationResponse, UpdateCompartmentVariables> {
}
