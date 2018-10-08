export enum ShareVisibility {
    DoNotShare = 0,
    Inherited = 0x01,
    ShareAllInternal = 0x02,
    ShareAllExternal = 0x04
}

export interface IShareVisibilityOption {
    id: ShareVisibility;
    label: string;
}

const ShareVisibilityOptions: IShareVisibilityOption[] = [
    {
        id: ShareVisibility.DoNotShare,
        label: "Not shared"
    },
    {
        id: ShareVisibility.Inherited,
        label: "Inherited"
    },
    {
        id: ShareVisibility.ShareAllInternal,
        label: "Internal"
    },
    {
        id: ShareVisibility.ShareAllExternal,
        label: "Public"
    }
];

export function NeuronVisibilityOptions(): IShareVisibilityOption[] {
    return ShareVisibilityOptions;
}

export function SampleVisibilityOptions(): IShareVisibilityOption[] {
    return ShareVisibilityOptions.filter(s => s.id !== ShareVisibility.Inherited);
}

export function FindVisibilityOption(id: number): IShareVisibilityOption {
    switch (id) {
        case ShareVisibility.Inherited:
            return ShareVisibilityOptions[1];
        case ShareVisibility.ShareAllInternal:
            return ShareVisibilityOptions[2];
        case ShareVisibility.ShareAllExternal:
            return ShareVisibilityOptions[3];
    }

    return ShareVisibilityOptions[0];
}
