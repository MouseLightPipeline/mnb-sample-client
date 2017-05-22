import gql from "graphql-tag";

export const AllSamplesQuery = gql`query AllSamplesQuery {
    samples {
        totalCount
        items {
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
        }
    }
}`;
    
export const SamplesQuery = gql`query Samples($input: SampleQueryInput) {
    samples(input: $input) {
        totalCount
        items {
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
