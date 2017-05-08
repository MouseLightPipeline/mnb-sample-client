import * as React from "react";
import {Panel, Table} from "react-bootstrap";
import {graphql, InjectedGraphQLProps} from 'react-apollo';
import gql from "graphql-tag";

import {PaginationHeader} from "./util/PaginationHeader";
import {IQueryOutput} from "../util/graphQLTypes";
import {displayNeuronBrainArea, formatSomaLocation, INeuron} from "../models/neuron";
import {displaySample} from "../models/sample";
import {truncate} from "../util/string";

const neuronsQuery = gql`query ($input: NeuronQueryInput) {
  neurons(input: $input) {
    totalCount
    items {
        id
        idNumber
        idString
        tag
        keywords
        x
        y
        z
        brainArea {
          id
          name
        }
        injection {
          id
          brainArea {
            id
            name
          }
          sample {
            id
            idNumber
            sampleDate
           }
        }
        createdAt
        updatedAt
    }
  }
}`;

interface ISamplesGraphQLProps {
    neurons: IQueryOutput<INeuron>;
}

interface ISamplesProps extends InjectedGraphQLProps<ISamplesGraphQLProps> {
    offset: number;
    limit: number;

    onUpdateOffsetForPage(page: number): void;
    onUpdateLimit(limit: number): void;
}

interface ISamplesState {
}

@graphql(neuronsQuery, {
    options: ({offset, limit}) => ({
        pollInterval: 5000,
        variables: {
            input: {
                offset: offset,
                limit: limit
            }
        }
    })
})
export class NeuronsTable extends React.Component<ISamplesProps, ISamplesState> {
    render() {
        const isDataAvailable = this.props.data && !this.props.data.loading;

        const neurons = isDataAvailable ? this.props.data.neurons.items : [];

        const rows = neurons.map(n => {
            return (<tr key={n.id}>
                <td>{n.idString}</td>
                <td>{n.tag}</td>
                <td>{displaySample(n.injection.sample)}</td>
                <td>{displayNeuronBrainArea(n)}</td>
                <td>{formatSomaLocation(n)}</td>
                <td>{truncate(n.keywords)}</td>
            </tr>)
        });

        const totalCount = isDataAvailable ? this.props.data.neurons.totalCount : -1;

        const pageCount = isDataAvailable ? Math.ceil(totalCount / this.props.limit) : 1;

        const activePage = rows ? (this.props.offset ? (Math.floor(this.props.offset / this.props.limit) + 1) : 1) : 0;

        return (
            <div className="card">
                <div className="card-header">
                    Neurons
                </div>
                <div className="card-block">
                    <PaginationHeader pageCount={pageCount}
                                      activePage={activePage}
                                      limit={this.props.limit}
                                      onUpdateLimitForPage={limit => this.props.onUpdateLimit(limit)}
                                      onUpdateOffsetForPage={page => this.props.onUpdateOffsetForPage(page)}/>
                    <Table style={{marginBottom: "0px"}}>
                        <thead>
                        <tr>
                            <th>Id</th>
                            <th>Tag</th>
                            <th>Sample</th>
                            <th>Soma Brain Area</th>
                            <th>Soma Sample Location</th>
                            <th>Keywords</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows}
                        </tbody>
                    </Table>
                    <div className="card-footer">
                        {totalCount >= 0 ? (totalCount > 0 ? `${totalCount} neurons` : "It's a clean slate - create the first neuron!") : ""}
                    </div>
                </div>
            </div>
        );
    }
}
