import * as React from "react";

import {displayBrainArea, IBrainArea} from "../../models/brainArea";
import {Option} from "react-select";
import {lookupBrainArea} from "../App";
import {DynamicSingleSelect, IDynamicSelectProps} from "../components/DynamicSelect";

export class BrainAreaSelect extends DynamicSingleSelect<IBrainArea, IBrainArea> {
    public constructor(props: IDynamicSelectProps<IBrainArea, IBrainArea, IBrainArea>) {
        super(props);
    }

    protected selectLabelForOption(option: IBrainArea): any {
        if (option) {
            return displayBrainArea(option);
        } else {
            return `${displayBrainArea(this.props.userData)} (inherited)`;
        }
    }

    protected filterOptions?(options: Option[], filterValue: string, currentValues: Option[]): Option[] {
        if (this.props.filterOptions) {
            return this.props.filterOptions(options, filterValue, currentValues);
        }

        return this.onFilterBrainAreas(options, filterValue, currentValues);
    }

    private onFilterBrainAreas(options: Option[], filterValue: string, currentValues: Option[]) {
        filterValue = filterValue.toLowerCase();

        if (currentValues) currentValues = currentValues.map((i: any) => i["value"]);

        const optionsInList = options.filter(option => {
            if (currentValues && currentValues.indexOf(option["value"]) > -1) {
                return false;
            }

            return this.onFilterBrainArea(option, filterValue);
        });

        return optionsInList.sort((a, b) => {
            const labelA = (a["label"] as string).toLowerCase();
            const labelB = (b["label"] as string).toLowerCase();

            if (labelA === filterValue) {
                return -1;
            }

            if (labelB === filterValue) {
                return 1;
            }

            const parts = filterValue.split(/\s+/);

            const partsA = labelA.split(/\s+/);
            const partsB = labelB.split(/\s+/);

            const areaA = lookupBrainArea(a["value"] as string);
            if (!areaA) {
                return -1;
            }

            const areaB = lookupBrainArea(b["value"] as string);
            if (!areaB) {
                return 1;
            }

            if (partsA.length > 1 && partsB.length > 1) {
                const countA = partsA.reduce((p, c) => {
                    return parts.some(p => p === c) ? p + 1 : p;
                }, 0);

                const countB = partsB.reduce((p, c) => {
                    return parts.some(p => p === c) ? p + 1 : p;
                }, 0);

                if (countA > 0 || countB > 0) {
                    if (countA === countB) {
                        return areaA.structureIdPath.split("/").length - areaB.structureIdPath.split("/").length;
                    } else {
                        return countB - countA;
                    }
                }
            }

            return areaA.structureIdPath.split("/").length - areaB.structureIdPath.split("/").length;
        });
    }

    private onFilterBrainArea(option: Option, filterValue: string) {
        if (!filterValue) {
            return true;
        }

        const labelTest = (option["label"] as string).toLowerCase();

        if (labelTest.indexOf(filterValue) >= 0) {
            return true;
        }

        const parts = filterValue.split(/\s+/);

        if (parts.length < 2) {
            return false;
        }

        const itemParts = labelTest.split(/\s+/);

        return parts.some(p => {
            return itemParts.some(i => i === p);
        });
    }
}
