import * as React from "react";
import {NeuronsTable} from "./NeuronsTable";

interface ICreateTracingProps {
}

interface ICreateTracingState {
    offset?: number;
    limit?: number;
}

export class Neurons extends React.Component<ICreateTracingProps, ICreateTracingState> {
    public constructor(props: ICreateTracingProps) {
        super(props);

        this.state = {offset: 0, limit: 10};
    }

    private onUpdateOffsetForPage(page: number) {
        this.setState({offset: this.state.limit * (page - 1)}, null);
    }

    private onUpdateLimit(limit: number) {
        this.setState({limit: limit}, null);
    }

    public render() {
        return (
            <NeuronsTable offset={this.state.offset}
                          limit={this.state.limit}
                          onUpdateOffsetForPage={page => this.onUpdateOffsetForPage(page)}
                          onUpdateLimit={limit => this.onUpdateLimit(limit)}/>
        );
    }
}
