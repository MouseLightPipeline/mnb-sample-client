import * as React from "react";

import {DynamicSingleSelect} from "../util/DynamicSelect";
import {displayRegistrationTransform, IRegistrationTransform} from "../../models/registrationTransform";

export class RegistrationTransformSelectSelect extends DynamicSingleSelect<IRegistrationTransform> {
    protected selectLabelForOption(option: IRegistrationTransform): any {
        return displayRegistrationTransform(option);
    }
}