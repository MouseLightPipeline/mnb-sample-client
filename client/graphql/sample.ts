import gql from "graphql-tag";

export const SAMPLE_FIELDS_FRAGMENT = gql`fragment SampleFields on Sample {
    id
    idNumber
    animalId
    tag
    comment
    sampleDate
    sharing
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
        id
        location
        name
    }
    registrationTransforms {
        id
        location
        name
        notes
    }
    createdAt
    updatedAt
}`;

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

export const CreateSampleMutation = gql`mutation CreateSample($sample: SampleInput) {
    createSample(sample: $sample) {
        sample {
            id
            idNumber
            animalId
            tag
            comment
            sampleDate
            sharing
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
                id
                location
                name
            }
            registrationTransforms {
                id
                location
                name
            }
            updatedAt
            createdAt
        }
        error {
            message
        }
    }
}`;

export const UpdateSampleMutation = gql`mutation UpdateSample($sample: SampleInput) {
    updateSample(sample: $sample) {
        sample {
            id
            idNumber
            animalId
            tag
            comment
            sampleDate
            sharing
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
                id
                location
                name
            }
            registrationTransforms {
                id
                location
                name
            }
            updatedAt
        }
        error {
            message
        }
    }
}`;

export const DeleteSampleMutation = gql`mutation DeleteSample($sample: SampleInput) {
    deleteSample(sample: $sample) {
        sample {
            id
        }
        error {
            message
        }
    }
}`;

export const NeuronCountsForSamplesQuery = gql`query NeuronCountsForSamples($ids: [String!]) {
    neuronCountsForSamples(ids: $ids) {
        counts {
            sampleId
            count
        }
        error {
            message
        }
    }
}`;

