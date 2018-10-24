import * as React from "react";

import {displayInjectionWithVirus, IInjection} from "../../models/injection";
import {DynamicSimpleSelect} from "../components/DynamicSelect";

export class InjectionSelect extends DynamicSimpleSelect<IInjection> {
    protected selectLabelForOption(option: IInjection): any {
        return displayInjectionWithVirus(option);
    }
}
