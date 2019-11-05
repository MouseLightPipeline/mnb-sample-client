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
    aliasList
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
/// Update Compartments (aliases)
///

export const UPDATE_COMPARTMENT_MUTATION = gql`mutation UpdateBrainArea($brainArea: BrainAreaInput) {
    updateBrainArea(brainArea: $brainArea) {
        brainArea {
            id
            aliasList
            updatedAt
        }
        error
    }
}`;

type UpdateCompartmentVariables = {
    brainArea: {
        id: string;
        aliasList: string[];
    }
}

export type UpdateCompartmentMutationData = {
    source: IBrainArea;
    error: string;
}

type UpdateCompartmentMutationResponse = {
    updateBrainArea: UpdateCompartmentMutationData;
}

export class UpdateCompartmentMutation extends Mutation<UpdateCompartmentMutationResponse, UpdateCompartmentVariables> {
}

///
/// Sync Compartments
///

export const SYNC_COMPARTMENTS_MUTATION = gql`mutation SyncCompartments {
    syncCompartments
}`;


type SyncCompartmentsMutationResponse = {
    syncCompartments: string;
}

export class SyncCompartmentsMutation extends Mutation<SyncCompartmentsMutationResponse, {}> {
}
