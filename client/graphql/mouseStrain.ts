import gql from "graphql-tag";
import {Query} from "react-apollo";

import {IMouseStrain} from "../models/mouseStrain";

export const MOUSE_STRAINS_QUERY = gql`query MouseStrains {
    mouseStrains {
        id
        name
    }
}`;

type MouseStrainsQueryResponse = {
    mouseStrains: IMouseStrain[];
}

export class MouseStrainsQuery extends Query<MouseStrainsQueryResponse, {}> {
}
