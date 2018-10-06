import * as React from "react";
import {graphql} from "react-apollo";
import gql from "graphql-tag";

import {Treebeard} from "react-treebeard";
// const treebeard = require("react-treebeard");

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


interface ICompartmentsProps {
    compartmentsQuery?: any;
}

interface ICompartmentsState {
    flag?: boolean;
    data?: any;
}

@graphql(CompartmentsQuery, {
    name: "compartmentsQuery",
    options: {
        pollingInterval: 30000
    }
})
export class Compartments extends React.Component<ICompartmentsProps, ICompartmentsState> {
    public constructor(props: ICompartmentsProps) {
        super(props);

        this.state = {
            flag: false,
            data: null
        }
    }

    componentWillReceiveProps(props: ICompartmentsProps) {
        const {loading, error} = props.compartmentsQuery;

        if (!loading && !error && this.state.data == null) {
            let sorted = props.compartmentsQuery.brainAreas.slice().sort((a: IBrainArea, b: IBrainArea) => {
                return a.depth - b.depth;
            });

            const parents = new Map<number, any>();

            const data = {
                name: sorted[0].name,
                toggled: true,
                children: [] as any[]
            };

            parents.set(sorted[0].structureId, data);

            sorted = sorted.slice(1);


            sorted.forEach((c: IBrainArea) => {

                const node = {
                    name: c.name,
                    toggled: false
                };

                parents.set(c.structureId, node);

                const parent = parents.get(c.parentStructureId);

                if (parent) {
                    if (!parent.children) {
                        parent.children = [] as any[];
                    }
                    parent.children.push(node);
                } else {
                    console.log(c);
                }
            });

            this.setState({data});
        }

    }

    public onToggle = (node: any, toggled: boolean) => {
        console.log(node);
        if (node.children) {
            node.toggled = toggled;
        }
        this.setState({flag: !this.state.flag});
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
