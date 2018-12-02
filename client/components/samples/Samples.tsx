import * as React from "react";

import {ISample} from "../../models/sample";
import {MOUSE_STRAINS_QUERY, MouseStrainsQuery} from "../../graphql/mouseStrain";
import {SamplesReactTable} from "./SamplesReactTable";

interface ISamplesProps {
    samples: ISample[];
}

export const Samples = (props: ISamplesProps) => (
    <MouseStrainsQuery query={MOUSE_STRAINS_QUERY} pollInterval={5000}>
        {({error, data}) => {
            if (error) {
                return null;
            }

            return (
                <div>
                    <SamplesReactTable samples={props.samples} mouseStrains={data.mouseStrains || null}/>
                </div>
            );
        }}
    </MouseStrainsQuery>
);
