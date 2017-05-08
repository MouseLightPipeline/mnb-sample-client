import * as React from "react";

import {DynamicSingleSelect} from "../util/DynamicSelect";
import {IShareVisibilityOption} from "../../util/ShareVisibility";
import {Option} from "react-select";

export class VisibilitySelect extends DynamicSingleSelect<IShareVisibilityOption> {
    protected selectLabelForOption(option: IShareVisibilityOption): any {
        return option.label;
    }
}
