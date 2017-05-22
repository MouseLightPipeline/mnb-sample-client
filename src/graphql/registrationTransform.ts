import gql from "graphql-tag";

export const CreateTransformMutation = gql`mutation CreateTransform($registrationTransform: RegistrationTransformInput, $makeActive: Boolean) {
    createRegistrationTransform(registrationTransform: $registrationTransform, makeActive: $makeActive) {
        registrationTransform {
            id
            name
            location
            notes
            updatedAt
            createdAt
        }
        error {
            message
        }
    }
}`;

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

export const DeleteRegistrationMutation = gql`mutation DeleteRegistrationTransform($registrationTransform: RegistrationTransformInput) {
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

export const SampleForRegistrationQuery = gql`query SampleForRegistrationQuery($id: String) {
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
