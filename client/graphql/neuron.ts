import gql from "graphql-tag";
import {Mutation, MutationFn, Query} from "react-apollo";
import {INeuron} from "../models/neuron";

export const NEURON_BASE_FIELDS_FRAGMENT = gql`fragment NeuronBaseFields on Neuron {
    id
    idNumber
    idString
    tag
    keywords
    x
    y
    z
    sharing
    doi
    createdAt
    updatedAt
}`;

const NEURON_RELATIONSHIP_FIELDS_FRAGMENT = gql`fragment NeuronRelationshipFields on Neuron {
    brainArea {
        id
        name
    }
    injection {
        id
        brainArea {
            id
            name
        }
        sample {
            id
            idNumber
            sampleDate
        }
    }
}`;

///
/// Neurons Query
///

export const NEURONS_QUERY = gql`query NeuronsQuery($input: NeuronQueryInput) {
    neurons(input: $input) {
        totalCount
        items {
            ...NeuronBaseFields
            ...NeuronRelationshipFields
        }
    }
}
${NEURON_BASE_FIELDS_FRAGMENT}
${NEURON_RELATIONSHIP_FIELDS_FRAGMENT}
`;

export type NeuronsQueryVariables = {
    input: {
        offset: number,
        limit: number,
        sortOrder: string
    }
}

type NeuronsQueryData = {
    totalCount: number;
    items: INeuron[];
}

type NeuronsQueryResponse = {
    neurons: NeuronsQueryData;
}

export class NeuronsQuery extends Query<NeuronsQueryResponse, NeuronsQueryVariables> {
}

///
/// Neuron Tracing Count Query
///

export const NEURON_TRACING_COUNT_QUERY = gql`query TracingForNeuronsCount($ids: [String!]) {
    tracingCountsForNeurons(ids: $ids) {
        counts {
            neuronId
            count
        }
        error {
            message
        }
    }
}`;

export type NeuronTracingCountVariables = {
    ids: string[]
}

export type NeuronTracingCount = {
    neuronId: string;
    count: number;
}

type NeuronTracingCountQueryData = {
    counts: NeuronTracingCount[];
    error: {
        message: string;
    }
}

type NeuronTracingCountResponse = {
    tracingCountsForNeurons: NeuronTracingCountQueryData;
}

export class NeuronTracingCountQuery extends Query<NeuronTracingCountResponse, NeuronTracingCountVariables> {
}

///
/// Mutation Input
///

type NeuronVariables = {
    id?: string;
    idNumber?: number;
    idString?: string;
    tag?: string;
    keywords?: string;
    x?: number;
    y?: number;
    z?: number;
    sharing?: number;
    injectionId?: string;
    brainAreaId?: string;
}

///
/// Create Neuron Mutation
///

export const CREATE_NEURON_MUTATION = gql`mutation CreateNeuron($neuron: NeuronInput) {
    createNeuron(neuron: $neuron) {
        neuron {
            ...NeuronBaseFields
            ...NeuronRelationshipFields
        }
        error {
            message
        }
    }
}
${NEURON_BASE_FIELDS_FRAGMENT}
${NEURON_RELATIONSHIP_FIELDS_FRAGMENT}
`;

type CreateNeuronVariables = {
    neuron: NeuronVariables;
}

export type CreateNeuronMutationData = {
    neuron: INeuron;
    error: {
        message: string;
    };
}

type CreateNeuronMutationResponse = {
    createNeuron: CreateNeuronMutationData;
}

export class CreateNeuronMutation extends Mutation<CreateNeuronMutationResponse, CreateNeuronVariables> {
}

///
/// Update Neuron Mutation
///

export const UPDATE_NEURON_MUTATION = gql`mutation UpdateNeuron($neuron: NeuronInput) {
    updateNeuron(neuron: $neuron) {
        neuron {
            ...NeuronBaseFields
            ...NeuronRelationshipFields
        }
        error {
            message
        }
    }
}
${NEURON_BASE_FIELDS_FRAGMENT}
${NEURON_RELATIONSHIP_FIELDS_FRAGMENT}
`;

type UpdateNeuronVariables = {
    neuron: NeuronVariables;
}

export type UpdateNeuronMutationData = {
    neuron: INeuron;
    error: {
        message: string;
    }
}

type UpdateNeuronMutationResponse = {
    updateNeuron: UpdateNeuronMutationData;
}

export class UpdateNeuronMutation extends Mutation<UpdateNeuronMutationResponse, UpdateNeuronVariables> {
}

export type UpdateNeuronMutationFn = MutationFn<UpdateNeuronMutationResponse, UpdateNeuronVariables>;

///
/// Delete Neuron Mutation
///

export const DELETE_NEURON_MUTATION = gql`mutation DeleteNeuron($neuron: NeuronInput) {
    deleteNeuron(neuron: $neuron) {
        id
        error {
            message
        }
    }
}`;

type DeleteNeuronVariables = {
    neuron: {
        id: string;
    }
}

type DeleteNeuronMutationData = {
    neuron: {
        id: string
    };
    error: {
        message: string;
    }
}

type DeleteNeuronMutationResponse = {
    deleteNeuron: DeleteNeuronMutationData;
}

export class DeleteNeuronMutation extends Mutation<DeleteNeuronMutationResponse, DeleteNeuronVariables> {
}
