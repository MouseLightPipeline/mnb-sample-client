import * as React from "react";
import {Table} from "semantic-ui-react";

import {INeuron} from "../../models/neuron";
import {NeuronRow} from "./NeuronRow";
import {NEURON_TRACING_COUNT_QUERY, NeuronTracingCountQuery} from "../../graphql/neuron";

interface INeuronTableProps {
    neurons: INeuron[];
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
                data.tracingCountsForNeurons.counts.map(c => counts.set(c.id, c.count));
            }

            const rows = props.neurons.map(n => {
                return <NeuronRow key={n.id} neuron={n} tracingCount={counts.get(n.id)} onDeleteNeuron={props.onDeleteNeuron}/>
            });

            return (
                <Table attached="bottom" compact="very" style={{borderBottom: "none", borderTop: "none"}}>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Id</Table.HeaderCell>
                            <Table.HeaderCell>Tag</Table.HeaderCell>
                            <Table.HeaderCell>Sample</Table.HeaderCell>
                            <Table.HeaderCell>Soma Brain Area</Table.HeaderCell>
                            <Table.HeaderCell>Soma Sample Location</Table.HeaderCell>
                            <Table.HeaderCell>Visibility</Table.HeaderCell>
                            <Table.HeaderCell>DOI</Table.HeaderCell>
                            <Table.HeaderCell/>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {rows}
                    </Table.Body>
                </Table>
            );
        }}
    </NeuronTracingCountQuery>
);