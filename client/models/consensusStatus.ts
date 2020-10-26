export enum ConsensusStatus {
    None,
    Pending,
    Limited,
    Full
}

export interface IConsensusStatusOption {
    key: ConsensusStatus;
    value: ConsensusStatus;
    text: string;
}

export const ConsensusStatusOptions: IConsensusStatusOption[] = [
    {
        key: ConsensusStatus.None,
        value: ConsensusStatus.None,
        text: "No"
    },
    {
        key: ConsensusStatus.Full,
        value: ConsensusStatus.Full,
        text: "Yes"
    }
];

export function FindConsensusStatusOption(id: number): IConsensusStatusOption {
    switch (id) {
        case ConsensusStatus.None:
            return ConsensusStatusOptions[0];
        case ConsensusStatus.Pending:
            return ConsensusStatusOptions[2];
        case ConsensusStatus.Limited:
            return ConsensusStatusOptions[3];
        case ConsensusStatus.Full:
            return ConsensusStatusOptions[1];
    }

    return ConsensusStatusOptions[0];
}