import * as React from "react";
import {graphql} from "react-apollo";
import gql from "graphql-tag";

import {Treebeard} from "react-treebeard";

import {IBrainArea} from "../models/brainArea";

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

interface ICompartmentNode {
    name: string;
    toggled: boolean;
    active: boolean;
    children: ICompartmentNode[];
    compartment: IBrainArea;
}

interface ICompartmentsProps {
    compartmentsQuery?: any;
}

interface ICompartmentsState {
    data?: ICompartmentNode;
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
            data: null,
            selectedNode: null
        }
    }

    public componentWillReceiveProps(props: ICompartmentsProps) {
        const {loading, error} = props.compartmentsQuery;

        if (loading || error) {
            return;
        }

        if (this.state.data == null) {
            let sorted = props.compartmentsQuery.brainAreas.slice().sort((a: IBrainArea, b: IBrainArea) => {
                return a.depth - b.depth;
            });

            const root = sorted[0];

            const data: ICompartmentNode = {
                name: root.name,
                toggled: true,
                active: true,
                children: null,
                compartment: root
            };

            this.compartments.set(sorted[0].structureId, data);

            sorted = sorted.slice(1);

            sorted.forEach((c: IBrainArea) => {
                const node: ICompartmentNode = {
                    name: c.name,
                    toggled: false,
                    active: false,
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

            this.setState({data});
        }
    }

    public onToggle = (node: ICompartmentNode, toggled: boolean) => {
        if (this.state.selectedNode && this.state.selectedNode != node) {
            this.state.selectedNode.active = false;
            node.active = true;
        }

        if (node.children) {
            node.toggled = toggled;
        }

        this.setState({selectedNode: node});
    };

    public render() {
        const {loading, error} = this.props.compartmentsQuery;

        if (loading) {
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


        return (
            <Treebeard data={this.state.data} onToggle={this.onToggle}/>
        );
    }
}
