import * as React from "react";
import {Grid, Row, Col} from "react-bootstrap";


import {NeuronsTable} from "./NeuronsTable";
import {UserPreferences} from "../util/userPreferences";

interface ICreateTracingProps {
    haveLoadedBrainAreas: boolean;
}

interface ICreateTracingState {
    offset?: number;
    limit?: number;
}

export class Neurons extends React.Component<ICreateTracingProps, ICreateTracingState> {
    public constructor(props: ICreateTracingProps) {
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
        }    }

    public render() {
        if (this.props.haveLoadedBrainAreas) {
            return (
                <Grid fluid>
                    <Row>
                        <Col xs={12}>
                            <NeuronsTable offset={this.state.offset}
                                          limit={this.state.limit}
                                          onUpdateOffsetForPage={page => this.onUpdateOffsetForPage(page)}
                                          onUpdateLimit={limit => this.onUpdateLimit(limit)}/>
                        </Col>
                    </Row>
                </Grid>
            );
        } else {
            return null;
        }
    }
}
