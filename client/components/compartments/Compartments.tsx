import * as React from "react";
import {Container, List, Table} from "semantic-ui-react";

import {IBrainArea} from "../../models/brainArea";
import {CompartmentNode} from "./CompartmentNode";
import {Compartment} from "./Compartment";

export interface ICompartmentsProps {
    compartments: IBrainArea[];
}

export interface ICompartmentNode {
    name: string;
    toggled: boolean;
    children: ICompartmentNode[];
    compartment: IBrainArea;
}

interface ICompartmentsState {
    rootNode?: ICompartmentNode;
    selectedNode?: ICompartmentNode;
}

export class Compartments extends React.Component<ICompartmentsProps, ICompartmentsState> {
    private compartments = new Map<number, ICompartmentNode>();

    public constructor(props: ICompartmentsProps) {
        super(props);

        this.state = Object.assign({}, this.updateTreeState(props, {
            rootNode: null,
            selectedNode: null
        }));
    }

    private updateTreeState(props: ICompartmentsProps, state: ICompartmentsState): ICompartmentsState {
        if (state.rootNode == null) {
            let sorted = props.compartments.slice().sort((a: IBrainArea, b: IBrainArea) => {
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

            return {rootNode: data, selectedNode: data};
        } else {
            props.compartments.map((c: IBrainArea) => {
                const existing: ICompartmentNode = this.compartments.get(c.structureId);

                if (existing && existing.compartment.updatedAt < c.updatedAt) {
                    console.log("updating more recent compartment");
                    existing.compartment = c;
                }
            });
        }

        return {};
    }

    public componentWillReceiveProps(props: ICompartmentsProps) {
        this.setState(this.updateTreeState(props, this.state));
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
        if (this.state.rootNode == null) {
            return null;
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
