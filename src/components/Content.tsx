import * as React from "react";

import {Samples} from "./Samples";
import {Neurons} from "./Neurons";

interface IContentProps {
    haveLoadedBrainAreas: boolean;
}

interface IContentState {
}

export class Content extends React.Component<IContentProps, IContentState> {
    public constructor(props: IContentProps) {
        super(props);
    }

    public render() {
        return (
            <div>
                <Samples haveLoadedBrainAreas={this.props.haveLoadedBrainAreas}/>
                <Neurons haveLoadedBrainAreas={this.props.haveLoadedBrainAreas}/>
            </div>
        );
    }
}
