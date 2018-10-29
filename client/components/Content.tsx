import * as React from "react";

import {Samples} from "./samples/Samples";
import {Neurons} from "./neurons/Neurons";
import {ISample} from "../models/sample";

interface IContentProps {
    samples: ISample[];
}

export const Content = (props: IContentProps) => (
    <div>
        <Samples samples={props.samples}/>
        <Neurons/>
    </div>
);
