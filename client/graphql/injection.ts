import gql from "graphql-tag";
import {Mutation, MutationFn, Query} from "react-apollo";

import {IInjection} from "../models/injection";
import {IFluorophore} from "../models/fluorophore";
import {IInjectionVirus} from "../models/injectionVirus";
import {NEURON_BASE_FIELDS_FRAGMENT} from "./neuron";

///
/// Fragments
///

export const INJECTION_FIELDS_FRAGMENT = gql`fragment InjectionFields on Injection {
    id
    injectionVirus {
        id
        name
    }
    fluorophore {
        id
        name
    }
    brainArea {
        id
        name
    }
    neurons {
        ...NeuronBaseFields
    }
}
${NEURON_BASE_FIELDS_FRAGMENT}
`;

///
/// Sample-Related Queries
///

export const INJECTIONS_FOR_SAMPLE_QUERY = gql`query InjectionsForSample($input: InjectionQueryInput) {
    injections(input: $input) {
        ...InjectionFields
    }
    injectionViruses {
        id
        name
    }
    fluorophores {
        id
        name
    }
}
${INJECTION_FIELDS_FRAGMENT}
`;

type InjectionsForSampleVariables = {
    input: {
        sampleIds: string[]
    }
}

type InjectionsForSampleQueryResponse = {
    injections: IInjection[];
    injectionViruses: IInjectionVirus[];
    fluorophores: IFluorophore[];
}

export class InjectionsForSampleQuery extends Query<InjectionsForSampleQueryResponse, InjectionsForSampleVariables> {
}

///
/// Mutation Types
///

export type InjectionVariables = {
    id: string;
    brainAreaId?: string;
    injectionVirusId?: string;
    injectionVirusName?: string;
    fluorophoreId?: string;
    fluorophoreName?: string;
    sampleId?: string;
}

///
/// Create Injection Mutation
///

export const CREATE_INJECTION_MUTATION = gql`mutation CreateInjection($injectionInput: InjectionInput) {
    createInjection(injectionInput: $injectionInput) {
        injection {
            ...InjectionFields
        }
        error {
            message
        }
    }
}
${INJECTION_FIELDS_FRAGMENT}
`;

type CreateInjectionVariables = {
    injectionInput: InjectionVariables;
}

export type CreateInjectionMutationData = {
    injection: IInjection;
    error: {
        message: string;
    };
}

type CreateInjectionMutationResponse = {
    createInjection: CreateInjectionMutationData;
}

export class CreateInjectionMutation extends Mutation<CreateInjectionMutationResponse, CreateInjectionVariables> {
}

///
/// Update Injection Mutation
///

export const UPDATE_INJECTION_MUTATION = gql`mutation UpdateInjection($injectionInput: InjectionInput) {
    updateInjection(injectionInput: $injectionInput) {
        injection {
            ...InjectionFields
        }
        error {
            message
        }
    }
}
${INJECTION_FIELDS_FRAGMENT}
`;

type UpdateInjectionVariables = {
    injectionInput: InjectionVariables;
}

export type UpdateInjectionMutationData = {
    injection: IInjection;
    error: {
        message: string;
    }
}

type UpdateInjectionMutationResponse = {
    updateInjection: UpdateInjectionMutationData;
}

export class UpdateInjectionMutation extends Mutation<UpdateInjectionMutationResponse, UpdateInjectionVariables> {
}

export type UpdateInjectionMutationFn = MutationFn<UpdateInjectionMutationResponse, UpdateInjectionVariables>;


///
/// Delete Injection Mutation
///

export const DELETE_INJECTION_MUTATION = gql`mutation DeleteInjection($injectionInput: InjectionInput) {
    deleteInjection(injectionInput: $injectionInput) {
        id
        error {
            message
        }
    }
}`;

type DeleteInjectionVariables = {
    injectionInput: {
        id: string;
    }
}

type DeleteInjectionMutationData = {
    iid: string,
    error: {
        message: string;
    }
}

type DeleteInjectionMutationResponse = {
    deleteInjection: DeleteInjectionMutationData;
}

export class DeleteInjectionMutation extends Mutation<DeleteInjectionMutationResponse, DeleteInjectionVariables> {
}
