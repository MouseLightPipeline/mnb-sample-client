import * as React from "react";

import {DynamicSimpleSelect} from "../util/DynamicSelect";
import {displayInjectionWithVirus, IInjection} from "../../models/injection";

export class InjectionSelect extends DynamicSimpleSelect<IInjection> {
    protected selectLabelForOption(option: IInjection): any {
        return displayInjectionWithVirus(option);
    }
}
