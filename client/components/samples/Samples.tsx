import * as React from "react";

import {SamplesTable} from "./SamplesTable";
import {UserPreferences} from "../../util/userPreferences";
import {MOUSE_STRAINS_QUERY, MouseStrainsQuery} from "../../graphql/mouseStrain";
import {Message} from "semantic-ui-react";
import {ISample} from "../../models/sample";

interface ISamplesProps {
    samples: ISample[];
}

interface ICreateTracingState {
    offset?: number;
    limit?: number;
}

export class Samples extends React.Component<ISamplesProps, ICreateTracingState> {
    public constructor(props: ISamplesProps) {
        super(props);

        this.state = {
            offset: UserPreferences.Instance.samplePageOffset,
            limit: UserPreferences.Instance.samplePageLimit
        };
    }

    private onUpdateOffsetForPage(page: number) {
        const offset = this.state.limit * (page - 1);

        if (offset != this.state.offset) {
            this.setState({offset});

            UserPreferences.Instance.samplePageOffset = offset;
        }
    }

    private onUpdateLimit(limit: number) {
        if (limit !== this.state.limit) {
            let offset = this.state.offset;

            if (offset < limit) {
                offset = 0;
            }

            this.setState({offset, limit});

            UserPreferences.Instance.samplePageOffset = offset;
            UserPreferences.Instance.samplePageLimit = limit;
        }
    }

    public render() {
        return (
            <MouseStrainsQuery query={MOUSE_STRAINS_QUERY} pollInterval={5000}>
                {({error, data}) => {
                    if (error) {
                        return (
                            <Message negative icon="exclamation triangle" header="Server unavailable"
                                     content="Mouse strain information could not be loaded.  Will attempt again shortly."/>
                        );
                    }

                    return (
                        <SamplesTable samples={this.props.samples}
                                      mouseStrainList={data.mouseStrains || null}
                                      offset={this.state.offset}
                                      limit={this.state.limit}
                                      onUpdateOffsetForPage={page => this.onUpdateOffsetForPage(page)}
                                      onUpdateLimit={limit => this.onUpdateLimit(limit)}/>
                    );
                }}
            </MouseStrainsQuery>

        );
    }
}
