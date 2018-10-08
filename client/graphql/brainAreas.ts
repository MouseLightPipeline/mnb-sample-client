import gql from "graphql-tag";

export const UpdateBrainAreaMutation = gql`mutation UpdateBrainArea($brainArea: BrainAreaInput) {
    updateBrainArea(brainArea: $brainArea) {
        brainArea {
            id
            aliases
            updatedAt
        }
        error {
            message
        }
    }
}`;
