import * as React from "react";

import {DynamicSingleSelect} from "../util/DynamicSelect";
import {displayMouseStrain, IMouseStrain} from "../../models/mouseStrain";

export class MouseStrainSelect extends DynamicSingleSelect<IMouseStrain> {
    protected selectLabelForOption(option: IMouseStrain): any {
        return displayMouseStrain(option);
    }
}
