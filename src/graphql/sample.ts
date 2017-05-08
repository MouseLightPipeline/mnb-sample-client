import gql from "graphql-tag";

export const SampleQuery = gql`query SampleQuery($id: String) {
    sample(id: $id) {
        id
        idNumber
        animalId
        tag
        comment
        sampleDate
        sharing
        mouseStrain {
            id
            name
        }
        injections {
            id
            brainArea {
                id
                name
            }
        }
        activeRegistrationTransform {
            id
            location
            name
        }
        registrationTransforms {
            id
            location
            name
            notes
        }
        createdAt
        updatedAt
    }
}`;
