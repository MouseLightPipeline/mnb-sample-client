import gql from "graphql-tag";

export const CreateMouseStrainMutation = gql`mutation CreateMouseStrain($mouseStrain: MouseStrainInput) {
    createMouseStrain(mouseStrain: $mouseStrain) {
        mouseStrain {
            id
            name
            updatedAt
            createdAt
        }
        error {
            message
        }
    }
}`;
