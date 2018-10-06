import * as React from "react";
import {graphql} from "react-apollo";
import gql from "graphql-tag";

const CompartmentsQuery = gql`query MouseStrains {
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
    }

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
            <div>
                loaded
            </div>
        );
    }
}
