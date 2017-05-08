import * as React from "react";

import {Samples} from "./Samples";
import {Neurons} from "./Neurons";

interface IContentProps {
}

interface IContentState {
}

export class Content extends React.Component<IContentProps, IContentState> {
    render() {
        return (
            <div>
                <Samples/>
                <Neurons/>
            </div>
        );
    }
}
