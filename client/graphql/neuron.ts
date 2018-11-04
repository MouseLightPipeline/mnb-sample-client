import gql from "graphql-tag";

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

export const NeuronsQuery = gql`query NeuronsQuery($input: NeuronQueryInput) {
    neurons(input: $input) {
        totalCount
        items {
            ...NeuronBaseFields
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
        }
    }
}
${NEURON_BASE_FIELDS_FRAGMENT}
`;

export const CreateNeuronMutation = gql`mutation CreateNeuron($neuron: NeuronInput) {
    createNeuron(neuron: $neuron) {
        neuron {
            id
            idNumber
            idString
            tag
            keywords
            x
            y
            z
            sharing
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
            }
            updatedAt
            createdAt
        }
        error {
            message
        }
    }
}`;

export const UpdateNeuronMutation = gql`mutation UpdateNeuron($neuron: NeuronInput) {
    updateNeuron(neuron: $neuron) {
        neuron {
            id
            idNumber
            idString
            tag
            keywords
            x
            y
            z
            sharing
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
            }
            createdAt
            updatedAt
        }
        error {
            message
        }
    }
}`;

export const DeleteNeuronMutation = gql`mutation DeleteNeuron($neuron: NeuronInput) {
    deleteNeuron(neuron: $neuron) {
        id
        error {
            message
        }
    }
}`;

export const TracingForNeuronsCountQuery = gql`query TracingForNeuronsCount {
    tracingCountsForNeurons {
        counts {
            neuronId
            count
        }
        error {
            message
        }
    }
}`;

