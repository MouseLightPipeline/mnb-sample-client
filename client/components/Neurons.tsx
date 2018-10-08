import * as React from "react";
import {Grid, Row, Col} from "react-bootstrap";


import {NeuronsTable} from "./NeuronsTable";

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

        this.state = {offset: 0, limit: 10};
    }

    private onUpdateOffsetForPage(page: number) {
        this.setState({offset: this.state.limit * (page - 1)}, null);
    }

    private onUpdateLimit(limit: number) {
        this.setState({limit: limit}, null);
    }

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
