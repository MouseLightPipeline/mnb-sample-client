export enum ShareVisibility {
    DoNotShare = 0,
    ShareAllInternal = 0x01,
    ShareAllExternal = 0x02
}

export interface IShareVisibilityOption {
    id: ShareVisibility;
    label: string;
}

export const ShareVisibilityOptions: IShareVisibilityOption[] = [
    {
        id: ShareVisibility.DoNotShare,
        label: "Not shared"
    } ,
    {
        id: ShareVisibility.ShareAllInternal,
        label: "Internal"
    },
    {
        id: ShareVisibility.ShareAllExternal,
        label: "Public"
    }
];

export function FindVisibilityOption(id: number): IShareVisibilityOption {
    switch (id) {
        case ShareVisibility.ShareAllInternal:
            return ShareVisibilityOptions[1];
        case ShareVisibility.ShareAllExternal:
            return ShareVisibilityOptions[2];
    }

    return ShareVisibilityOptions[0];
}
