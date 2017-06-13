import * as React from "react";

import {IShareVisibilityOption} from "../../util/ShareVisibility";
import {DynamicSimpleSelect} from "ndb-react-components";

export class VisibilitySelect extends DynamicSimpleSelect<IShareVisibilityOption> {
    protected selectLabelForOption(option: IShareVisibilityOption): any {
        return option.label;
    }
}
