import gql from "graphql-tag";

export const SampleForInjectionQuery = gql`query SampleForInjectionQuery($id: String) {
    sample(id: $id) {
        id
        idNumber
        sampleDate
        injections {
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
        }
    }
}`;

export const InjectionsForSampleQuery = gql`query InjectionsForSample($input: InjectionQueryInput) {
    injections(input: $input) {
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
     }
}`;

export const InjectionViruses = gql`query InjectionVirus {
    injectionViruses {
        id
        name
    }
}`;

export const Fluorophores = gql`query Fluorophores {
    fluorophores {
        id
        name
    }
}`;

export const NeuronCountsForInjectionsQuery = gql`query NeuronCountsForInjections($ids: [String!]) {
    neuronCountsForInjections(ids: $ids) {
        counts {
            injectionId
            count
        }
        error {
            message
        }
    }
}`;

export const CreateInjectionMutation = gql`mutation CreateInjection($injectionInput: InjectionInput) {
    createInjection(injectionInput: $injectionInput) {
        injection {
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
        }
        error {
            message
        }
    }
}`;

export const UpdateInjectionMutation = gql`mutation UpdateInjection($injectionInput: InjectionInput) {
    updateInjection(injectionInput: $injectionInput) {
        injection {
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
            updatedAt
        }
        error {
            message
        }
    }
}`;

export const DeleteInjectionMutation = gql`mutation DeleteInjection($injectionInput: InjectionInput) {
    deleteInjection(injectionInput: $injectionInput) {
        injection {
            id
        }
        error {
            message
        }
    }
}`;
