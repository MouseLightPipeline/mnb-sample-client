import * as React from "react";

// import {NeuronsTable} from "./NeuronsTable";
import {UserPreferences} from "../../util/userPreferences";

interface ICreateTracingState {
    offset?: number;
    limit?: number;
}

export class Neurons extends React.Component<{}, ICreateTracingState> {
    public constructor(props: {}) {
        super(props);

        this.state = {
            offset: UserPreferences.Instance.neuronPageOffset,
            limit: UserPreferences.Instance.neuronPageLimit
        }
    }

    private onUpdateOffsetForPage(page: number) {
        const offset = this.state.limit * (page - 1);

        if (offset != this.state.offset) {
            this.setState({offset});

            UserPreferences.Instance.neuronPageOffset = offset;
        }
    }

    private onUpdateLimit(limit: number) {
        if (limit !== this.state.limit) {
            let offset = this.state.offset;

            if (offset < limit) {
                offset = 0;
            }

            this.setState({offset, limit});

            UserPreferences.Instance.neuronPageOffset = offset;
            UserPreferences.Instance.neuronPageLimit = limit;
        }
    }

    public render() {
        return (
            <h4>Neurons</h4>
        );
    }
}

/*
                            <NeuronsTable offset={this.state.offset}
                                          limit={this.state.limit}
                                          onUpdateOffsetForPage={page => this.onUpdateOffsetForPage(page)}
                                          onUpdateLimit={limit => this.onUpdateLimit(limit)}/>
                                          */