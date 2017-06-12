import * as React from "react";

import {DynamicSimpleSelect} from "../util/DynamicSelect";
import {IShareVisibilityOption} from "../../util/ShareVisibility";

export class VisibilitySelect extends DynamicSimpleSelect<IShareVisibilityOption> {
    protected selectLabelForOption(option: IShareVisibilityOption): any {
        return option.label;
    }
}
