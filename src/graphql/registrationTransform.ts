import gql from "graphql-tag";

export const UpdateRegistrationMutation = gql`mutation UpdateRegistrationMutation($registrationTransform: RegistrationTransformInput) {
    updateRegistrationTransform(registrationTransform: $registrationTransform) {
        registrationTransform {
            id
            location
            name
            notes
            updatedAt
        }
        error {
            message
        }
    }
}`;

export const DeleteRegistrationMutation = gql`mutation deleteRegistrationTransform($registrationTransform: RegistrationTransformInput) {
    deleteRegistrationTransform(registrationTransform: $registrationTransform) {
        registrationTransform {
            id
        }
        error {
            message
        }
    }
}`;

export const TracingCountQuery = gql`query TracingCountQuery {
    tracingCountsForRegistrations {
        counts {
            transformId
            count
        }
        error {
            message
        }
    }
}`;

export const SampleForRegistrationsQuery = gql`query SampleQuery($id: String) {
    sample(id: $id) {
        id
        idNumber
        sampleDate
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
    }
}`;
