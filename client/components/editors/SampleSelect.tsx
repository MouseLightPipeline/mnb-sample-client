import * as React from "react";

import {displaySample, ISample} from "../../models/sample";
import {DynamicSimpleSelect} from "../components/DynamicSelect";

export class SampleSelect extends DynamicSimpleSelect<ISample> {
    protected selectLabelForOption(option: ISample) {
        return displaySample(option);
    }
}
