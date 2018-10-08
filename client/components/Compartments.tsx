import * as React from "react";
import {Container, List, Table} from "semantic-ui-react";
import {graphql} from "react-apollo";
import gql from "graphql-tag";

import {IBrainArea} from "../models/brainArea";
import {Compartment} from "./Compartment";
import {CompartmentNode} from "./CompartmentNode";

const CompartmentsQuery = gql`query Compartments {
    brainAreas {
        id
        name
        structureId
        depth
        parentStructureId
        structureIdPath
        safeName
        acronym
        aliases
        atlasId
        graphId
        graphOrder
        hemisphereId
        geometryFile
        geometryColor
        geometryEnable
        createdAt
        updatedAt
    }
}`;

export interface ICompartmentNode {
    name: string;
    toggled: boolean;
    children: ICompartmentNode[];
    compartment: IBrainArea;
}

interface ICompartmentsProps {
    compartmentsQuery?: any;
}

interface ICompartmentsState {
    rootNode?: ICompartmentNode;
    selectedNode?: ICompartmentNode;
}

@graphql(CompartmentsQuery, {
    name: "compartmentsQuery",
    options: {
        pollingInterval: 60000
    }
})
export class Compartments extends React.Component<ICompartmentsProps, ICompartmentsState> {
    private compartments = new Map<number, ICompartmentNode>();

    public constructor(props: ICompartmentsProps) {
        super(props);

        this.state = {
            rootNode: null,
            selectedNode: null
        }
    }

    public componentWillReceiveProps(props: ICompartmentsProps) {
        const {loading, error} = props.compartmentsQuery;

        if (loading || error) {
            return;
        }

        if (this.state.rootNode == null) {
            let sorted = props.compartmentsQuery.brainAreas.slice().sort((a: IBrainArea, b: IBrainArea) => {
                return a.depth - b.depth;
            });

            const root = sorted[0];

            const data: ICompartmentNode = {
                name: root.name,
                toggled: true,
                children: null,
                compartment: root
            };

            this.compartments.set(sorted[0].structureId, data);

            sorted = sorted.slice(1);

            sorted.forEach((c: IBrainArea) => {
                const node: ICompartmentNode = {
                    name: c.name,
                    toggled: false,
                    children: null,
                    compartment: c
                };

                this.compartments.set(c.structureId, node);

                const parent = this.compartments.get(c.parentStructureId);

                if (parent) {
                    if (!parent.children) {
                        parent.children = [];
                    }
                    parent.children.push(node);
                }
            });

            this.setState({rootNode: data, selectedNode: data});
        } else {
            props.compartmentsQuery.brainAreas.map((c: IBrainArea) => {
                const existing: ICompartmentNode = this.compartments.get(c.structureId);

                if (existing && existing.compartment.updatedAt < c.updatedAt) {
                    console.log("updating more recent compartment");
                    existing.compartment = c;
                }
            });
        }
    }

    public onSelect = (node: ICompartmentNode) => {
        this.setState({selectedNode: node});
    };

    public onToggle = (node: ICompartmentNode) => {
        if (node.children) {
            node.toggled = !node.toggled;
        }

        this.setState({selectedNode: node});
    };

    public render() {
        const {loading, error} = this.props.compartmentsQuery;

        if (loading || this.state.rootNode === null) {
            return (
                <div>
                    loading
                </div>
            );
        }

        if (error) {
            return (
                <div>
                    {error.toString()}
                </div>
            );
        }

        // TODO Using Table due to overloaded Grid css between semantic-ui-react and react-bootstrap
        return (
            <Container fluid>
                <Table basic="very">
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell width={8} verticalAlign="top">
                                <List>
                                    <CompartmentNode compartmentNode={this.state.rootNode}
                                                     selectedNode={this.state.selectedNode}
                                                     onToggle={(node) => this.onToggle(node)}
                                                     onSelect={(node) => this.onSelect(node)}/>
                                </List>
                            </Table.Cell>
                            <Table.Cell width={8} verticalAlign="top">
                                <Compartment
                                    compartment={this.state.selectedNode ? this.state.selectedNode.compartment : null}/>
                            </Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table>
            </Container>
        );
    }
}
