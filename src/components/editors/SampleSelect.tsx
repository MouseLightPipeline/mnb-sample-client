import * as React from "react";

import {DynamicSimpleSelect} from "../util/DynamicSelect";
import {displaySample, ISample} from "../../models/sample";

export class SampleSelect extends DynamicSimpleSelect<ISample> {
    protected selectLabelForOption(option: ISample) {
        return displaySample(option);
    }
}
