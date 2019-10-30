import gql from "graphql-tag";
import {IRegistrationTransform} from "../models/registrationTransform";
import {Mutation, MutationFn, Query} from "react-apollo";

///
/// Fragments
///

export const TRANSFORM_FIELDS_FRAGMENT = gql`fragment TransformFields on RegistrationTransform {
    id
    name
    location
    notes
    updatedAt
    createdAt
}`;

///
/// Query for Tracings
///

export const TRANSFORM_TRACING_COUNT_QUERY = gql`query TracingCountQuery($ids: [String!]) {
    tracingCountsForRegistrations(ids: $ids) {
        counts {
            id
            count
        }
        error
    }
}`;

export type TransformTracingCountVariables = {
    ids: string[]
}

export type TransformTracingCount = {
    id: string;
    count: number;
}

type TransformTracingCountQueryData = {
    counts: TransformTracingCount[];
    error: string;
}

type TransformTracingCountResponse = {
    tracingCountsForRegistrations: TransformTracingCountQueryData;
}

export class TransformTracingCountQuery extends Query<TransformTracingCountResponse, TransformTracingCountVariables> {
}

///
/// Mutation Types
///

export type TransformVariables = {
    id: string;
    location?: string;
    name?: string;
    notes?: string;
    sampleId?: string;
}

///
/// Create Transform Mutation
///

export const CREATE_TRANSFORM_MUTATION = gql`mutation CreateTransform($registrationTransform: RegistrationTransformInput, $makeActive: Boolean) {
    createRegistrationTransform(registrationTransform: $registrationTransform, makeActive: $makeActive) {
        registrationTransform {
            ...TransformFields
        }
        error {
            message
        }
    }
}
${TRANSFORM_FIELDS_FRAGMENT}
`;

type CreateTransformVariables = {
    registrationTransform: TransformVariables;
    makeActive: boolean;
}

export type CreateTransformMutationData = {
    registrationTransform: IRegistrationTransform;
    error: {
        message: string;
    };
}

type CreateTransformMutationResponse = {
    createRegistrationTransform: CreateTransformMutationData;
}

export class CreateTransformMutation extends Mutation<CreateTransformMutationResponse, CreateTransformVariables> {
}

///
/// Update Transform Mutation
///

export const UPDATE_TRANSFORM_MUTATION = gql`mutation updateRegistrationTransform($registrationTransform: RegistrationTransformInput) {
    updateRegistrationTransform(registrationTransform: $registrationTransform) {
        registrationTransform {
            ...TransformFields
        }
        error {
            message
        }
    }
}
${TRANSFORM_FIELDS_FRAGMENT}
`;

type UpdateTransformVariables = {
    registrationTransform: TransformVariables;
}

export type UpdateTransformMutationData = {
    registrationTransform: IRegistrationTransform;
    error: {
        message: string;
    }
}

type UpdateTransformMutationResponse = {
    updateRegistrationTransform: UpdateTransformMutationData;
}

export class UpdateTransformMutation extends Mutation<UpdateTransformMutationResponse, UpdateTransformVariables> {
}

export type UpdateTransformMutationFn = MutationFn<UpdateTransformMutationResponse, UpdateTransformVariables>;

///
/// Delete Transform Mutation
///

export const DELETE_TRANSFORM_MUTATION = gql`mutation DeleteRegistrationTransform($registrationTransform: RegistrationTransformInput) {
    deleteRegistrationTransform(registrationTransform: $registrationTransform) {
        registrationTransform {
            id
        }
        error {
            message
        }
    }
}`;

type DeleteTransformVariables = {
    registrationTransform: {
        id: string;
    }
}

type DeleteTransformMutationData = {
    registrationTransform: {
        id: string
    };
    error: {
        message: string;
    }
}

type DeleteTransformMutationResponse = {
    deleteRegistrationTransform: DeleteTransformMutationData;
}

export class DeleteTransformMutation extends Mutation<DeleteTransformMutationResponse, DeleteTransformVariables> {
}
