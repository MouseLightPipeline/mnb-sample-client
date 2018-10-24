import * as React from "react";

import {displayRegistrationTransform, IRegistrationTransform} from "../../models/registrationTransform";
import {DynamicSimpleSelect} from "../components/DynamicSelect";

export class RegistrationTransformSelectSelect extends DynamicSimpleSelect<IRegistrationTransform> {
    protected selectLabelForOption(option: IRegistrationTransform): any {
        return displayRegistrationTransform(option);
    }
}