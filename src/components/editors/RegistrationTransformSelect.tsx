import * as React from "react";

import {DynamicSimpleSelect} from "../util/DynamicSelect";
import {displayRegistrationTransform, IRegistrationTransform} from "../../models/registrationTransform";

export class RegistrationTransformSelectSelect extends DynamicSimpleSelect<IRegistrationTransform> {
    protected selectLabelForOption(option: IRegistrationTransform): any {
        return displayRegistrationTransform(option);
    }
}