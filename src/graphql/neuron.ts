import gql from "graphql-tag";

export const NeuronsQuery = gql`query NeuronsQuery($input: NeuronQueryInput) {
    neurons(input: $input) {
        totalCount
        items {
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
                sample {
                    id
                    idNumber
                    sampleDate
                }
            }
            createdAt
            updatedAt
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
                sample {
                    id
                    idNumber
                    sampleDate
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
