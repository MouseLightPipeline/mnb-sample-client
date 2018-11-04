import * as React from "react";

import {Samples} from "./samples/Samples";
import {Neurons} from "./neurons/Neurons";
import {ISample} from "../models/sample";
import {Divider} from "semantic-ui-react";

interface IContentProps {
    samples: ISample[];
}

export const Content = (props: IContentProps) => (
    <div>
        <Samples samples={props.samples}/>
        <Divider/>
        <Neurons samples={props.samples}/>
    </div>
);
