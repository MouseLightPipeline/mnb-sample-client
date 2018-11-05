import {Query} from "react-apollo";
import gql from "graphql-tag";

import {IBrainArea} from "../models/brainArea";
import {ISample} from "../models/sample";

import {COMPARTMENT_FIELDS_FRAGMENT} from "./compartment";
import {SAMPLE_FIELDS_FRAGMENT} from "./sample";

export const APP_QUERY = gql`query AppQuery {
    brainAreas {
        ...CompartmentFields
    }
    samples {
        totalCount
        items {
            ...SampleFields
        }
    }
}
${COMPARTMENT_FIELDS_FRAGMENT}
${SAMPLE_FIELDS_FRAGMENT}
`;

type AppQueryResponse = {
    brainAreas: IBrainArea[];
    samples: {
        totalCount: number;
        items: ISample[]
    };
}

export class AppQuery extends Query<AppQueryResponse, {}> {
}
