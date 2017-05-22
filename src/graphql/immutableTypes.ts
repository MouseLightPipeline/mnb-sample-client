import gql from "graphql-tag";

export const ImmutableQuery = gql`query {
    brainAreas {
        id
        name
        structureId
        depth
        parentStructureId
        structureIdPath
        safeName
        acronym
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

