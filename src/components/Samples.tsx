import * as React from "react";
import {graphql} from "react-apollo";
import gql from "graphql-tag";
import {GraphQLDataProps} from "react-apollo/lib/graphql";
import {Grid, Row, Col} from "react-bootstrap";

import {IMouseStrain} from "../models/mouseStrain";
import {SamplesTable} from "./SamplesTable";

const MouseStrainsQuery = gql`query MouseStrains {
    mouseStrains {
        id
        name
    }
}`;

interface ITracingStructuresQueryProps {
    mouseStrains: IMouseStrain[];
}

interface ICreateTracingProps {
    haveLoadedBrainAreas: boolean;
    mouseStrainsQuery?: ITracingStructuresQueryProps & GraphQLDataProps;
}

interface ICreateTracingState {
    offset?: number;
    limit?: number;
}

@graphql(MouseStrainsQuery, {
    name: "mouseStrainsQuery",
    options: {
        pollingInterval: 5000
    }
})
export class Samples extends React.Component<ICreateTracingProps, ICreateTracingState> {
    public constructor(props: ICreateTracingProps) {
        super(props);

        this.state = {offset: 0, limit: 10};
    }

    private onUpdateOffsetForPage(page: number) {
        this.setState({offset: this.state.limit * (page - 1)}, null);
    }

    private onUpdateLimit(limit: number) {
        if (limit !== this.state.limit) {
            this.setState({offset: 0, limit: limit}, null);
        }
    }

    public render() {
        const mouseStrains = this.props.mouseStrainsQuery && !this.props.mouseStrainsQuery.loading ? this.props.mouseStrainsQuery.mouseStrains : [];

        return (
            <Grid fluid>
                <Row>
                    <Col xs={12}>
                        <SamplesTable mouseStrains={mouseStrains}
                                      offset={this.state.offset}
                                      limit={this.state.limit}
                                      onUpdateOffsetForPage={page => this.onUpdateOffsetForPage(page)}
                                      onUpdateLimit={limit => this.onUpdateLimit(limit)}/>
                    </Col>
                </Row>
            </Grid>

        );
    }
}
