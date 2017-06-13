import * as React from "react";

import {displayMouseStrain, IMouseStrain} from "../../models/mouseStrain";
import {DynamicSimpleSelect} from "ndb-react-components";

export class MouseStrainSelect extends DynamicSimpleSelect<IMouseStrain> {
    protected selectLabelForOption(option: IMouseStrain): any {
        return displayMouseStrain(option);
    }
}
