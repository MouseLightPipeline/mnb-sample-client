import gql from "graphql-tag";
import {Mutation, MutationFn} from "react-apollo";

import {ISample} from "../models/sample";
import {TRANSFORM_FIELDS_FRAGMENT} from "./transform";

export const SAMPLE_FIELDS_FRAGMENT = gql`fragment SampleFields on Sample {
    id
    idNumber
    animalId
    tag
    comment
    sampleDate
    sharing
    neuronCount
    mouseStrain {
        id
        name
    }
    injections {
        id
        brainArea {
            id
            name
        }
    }
    activeRegistrationTransform {
        ...TransformFields
    }
    registrationTransforms {
        ...TransformFields
    }
    createdAt
    updatedAt
}
${TRANSFORM_FIELDS_FRAGMENT}
`;

///
/// Samples Query
///

export const SAMPLES_QUERY = gql`query {
    samples {
        totalCount
        items {
            ...SampleFields
        }
    }
}
${SAMPLE_FIELDS_FRAGMENT}
`;

///
/// Mutation Input

type SampleVariables = {
    id?: string;
    idNumber?: number;
    animalId?: string;
    tag?: string;
    aliases?: string[];
    comment?: string;
    sampleDate?: number;
    sharing?: number;
    mouseStrainId?: string;
    mouseStrainName?: string;
    activeRegistrationTransformId?: string;
}

///
/// Create Sample Mutation
///

export const CREATE_SAMPLE_MUTATION = gql`mutation CreateSample($sample: SampleInput) {
    createSample(sample: $sample) {
        sample {
           ...SampleFields
        }
        error {
            message
        }
    }
}
${SAMPLE_FIELDS_FRAGMENT}
`;

type CreateSampleVariables = {
    sample: SampleVariables;
}

export type CreateSampleMutationData = {
    sample: ISample;
    error: {
        message: string;
    };
}

type CreateSampleMutationResponse = {
    createSample: CreateSampleMutationData;
}

export class CreateSampleMutation extends Mutation<CreateSampleMutationResponse, CreateSampleVariables> {
}

///
/// Update Sample Mutation
///

export const UPDATE_SAMPLE_MUTATION = gql`mutation UpdateSample($sample: SampleInput) {
    updateSample(sample: $sample) {
        sample {
            ...SampleFields
        }
        error {
            message
        }
    }
}
${SAMPLE_FIELDS_FRAGMENT}
`;

type UpdateSampleVariables = {
    sample: SampleVariables;
}

export type UpdateSampleMutationData = {
    sample: ISample;
    error: {
        message: string;
    }
}

type UpdateSampleMutationResponse = {
    updateSample: UpdateSampleMutationData;
}

export class UpdateSampleMutation extends Mutation<UpdateSampleMutationResponse, UpdateSampleVariables> {
}

export type UpdateSampleMutationFn = MutationFn<UpdateSampleMutationResponse, UpdateSampleVariables>;

///
/// Delete Sample Mutation
///

export const DELETE_SAMPLE_MUTATION = gql`mutation DeleteSample($sample: SampleInput) {
    deleteSample(sample: $sample) {
        sample {
            id
        }
        error {
            message
        }
    }
}`;

type DeleteSampleVariables = {
    sample: {
        id: string;
    }
}

type DeleteSampleMutationData = {
    sample: {
        id: string
    };
    error: {
        message: string;
    }
}

type DeleteSampleMutationResponse = {
    deleteSample: DeleteSampleMutationData;
}

export class DeleteSampleMutation extends Mutation<DeleteSampleMutationResponse, DeleteSampleVariables> {
}