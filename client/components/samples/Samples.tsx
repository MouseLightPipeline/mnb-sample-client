import * as React from "react";
import {Message} from "semantic-ui-react";

import {ISample} from "../../models/sample";
import {SamplesTable} from "./SamplesTable";
import {MOUSE_STRAINS_QUERY, MouseStrainsQuery} from "../../graphql/mouseStrain";

interface ISamplesProps {
    samples: ISample[];
}

export const Samples = (props: ISamplesProps) => (
    <MouseStrainsQuery query={MOUSE_STRAINS_QUERY} pollInterval={5000}>
        {({error, data}) => {
            if (error) {
                return (
                    <Message negative icon="exclamation triangle" header="Service not responding"
                             content="System data could not be loaded.  Will attempt again shortly."/>
                );
            }

            return (
                <SamplesTable samples={props.samples} mouseStrains={data.mouseStrains || null}/>
            );
        }}
    </MouseStrainsQuery>

);
