import gql from "graphql-tag";
import {IBrainArea} from "../models/brainArea";
import {Query} from "react-apollo";
import {IInjection} from "../models/injection";

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
}`;

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

export const INJECTIONS_FOR_SAMPLE_QUERY = gql`query InjectionsForSample($input: InjectionQueryInput) {
    injections(input: $input) {
        ...InjectionFields
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
}

export class InjectionsForSampleQuery extends Query<InjectionsForSampleQueryResponse, InjectionsForSampleVariables> {
}

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
