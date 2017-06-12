import * as React from "react";

import {DynamicSimpleSelect} from "../util/DynamicSelect";
import {displayMouseStrain, IMouseStrain} from "../../models/mouseStrain";

export class MouseStrainSelect extends DynamicSimpleSelect<IMouseStrain> {
    protected selectLabelForOption(option: IMouseStrain): any {
        return displayMouseStrain(option);
    }
}
