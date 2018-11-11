import * as React from "react";
import {Table} from "semantic-ui-react";

import {INeuron} from "../../models/neuron";
import {NeuronRow} from "./NeuronRow";
import {NEURON_TRACING_COUNT_QUERY, NeuronTracingCountQuery} from "../../graphql/neuron";

interface INeuronTableProps {
    neurons: INeuron[];
    totalCount: number;
    offset: number;
    limit: number;
    activePage: number;
    pageCount: number;

    onDeleteNeuron(neuron: INeuron): void;
}

export const NeuronsTable = (props: INeuronTableProps) => (
    <NeuronTracingCountQuery query={NEURON_TRACING_COUNT_QUERY} pollInterval={30000} skip={props.neurons.length === 0}
                             variables={{ids: props.neurons.map(n => n.id)}}>
        {({loading, error, data}) => {
            const counts = new Map<string, number>();

            if (!error && data && data.tracingCountsForNeurons) {
                data.tracingCountsForNeurons.counts.map(c => counts.set(c.neuronId, c.count));
            }

            const start = props.offset + 1;
            const end = Math.min(props.offset + props.limit, props.totalCount);

            const rows = props.neurons.map(n => {
                return <NeuronRow key={n.id} neuron={n} tracingCount={counts.get(n.id)} onDeleteNeuron={props.onDeleteNeuron}/>
            });

            return (
                <Table attached="bottom" compact="very">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Id</Table.HeaderCell>
                            <Table.HeaderCell>Tag</Table.HeaderCell>
                            <Table.HeaderCell>Sample</Table.HeaderCell>
                            <Table.HeaderCell>Soma Brain Area</Table.HeaderCell>
                            <Table.HeaderCell>Soma Sample Location</Table.HeaderCell>
                            <Table.HeaderCell>Keywords</Table.HeaderCell>
                            <Table.HeaderCell>Visibility</Table.HeaderCell>
                            <Table.HeaderCell>DOI</Table.HeaderCell>
                            <Table.HeaderCell>Created</Table.HeaderCell>
                            <Table.HeaderCell/>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {rows}
                    </Table.Body>
                    <Table.Footer fullwidth="true">
                        <Table.Row>
                            <Table.HeaderCell colSpan={5}>
                                {props.totalCount >= 0 ? (props.totalCount > 0 ? `Showing ${start} to ${end} of ${props.totalCount} neurons` : "It's a clean slate - create the first neuron!") : ""}
                            </Table.HeaderCell>
                            <Table.HeaderCell colSpan={6} textAlign="right">
                                {`Page ${props.activePage} of ${props.pageCount}`}
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Footer>
                </Table>
            );
        }}
    </NeuronTracingCountQuery>
);