import * as React from "react";
import {Button, Container, Dropdown, DropdownItemProps, Icon, Segment, Table} from "semantic-ui-react";
import {displayBrainArea, IBrainArea} from "../../models/brainArea";
import {BrainAreas, lookupBrainArea} from "../App";
import {FindVisibilityOption, ShareVisibility} from "../../util/ShareVisibility";

interface IBrainAreaDropdownProps {
    brainArea: IBrainArea;
    inheritedBrainArea?: IBrainArea;
    isEditOnly?: boolean;

    onBrainAreaChange(brainArea: IBrainArea): void;
}

interface IBrainAreaDropdownState {
    selectedBrainArea: IBrainArea;

    isInEditMode: boolean;
}

export class BrainAreaDropdown extends React.Component<IBrainAreaDropdownProps, IBrainAreaDropdownState> {
    public constructor(props: IBrainAreaDropdownProps) {
        super(props);

        this.state = {
            isInEditMode: false,
            selectedBrainArea: props.brainArea
        }
    }

    public render() {
        const items = BrainAreas.map(b => {
            return {value: b.id, text: displayBrainArea(b)}
        });

        if (!this.state.isInEditMode && !this.props.isEditOnly) {
            return (
                <a onClick={() => this.setState({isInEditMode: true})}>
                    {`${displayBrainArea(this.state.selectedBrainArea || this.props.inheritedBrainArea || null)} ${this.state.selectedBrainArea ? "" : " (from injection)"}`}
                </a>
            );
        }

        if (this.props.isEditOnly) {
            return (
                <Dropdown fluid selection lazyLoad={true} clearable options={items}
                          className="label"
                          search={brainAreaDeepSearch}
                          value={this.props.brainArea ? this.props.brainArea.id : null}
                          onChange={(e, {value}) => {
                              this.props.onBrainAreaChange(lookupBrainArea(value as string))
                          }}/>
            )
        }

        return (
            <Table fluid basic="very" verticalAlign="middle">
                <Table.Body>
                    <Table.Row>
                        <Table.Cell collapsing>
                            <Icon name="cancel" circular
                                  style={{marginTop: "5px"}}
                                  onClick={() => this.setState({
                                      isInEditMode: false,
                                      selectedBrainArea: this.props.brainArea
                                  })}/>
                        </Table.Cell>
                        <Table.Cell>
                            <Dropdown fluid search selection placeholder="Select brain area..." options={items}
                                      value={this.state.selectedBrainArea ? this.state.selectedBrainArea.id : null}
                                      onChange={(e, {value}) => {
                                          this.setState({selectedBrainArea: lookupBrainArea(value as string)});
                                      }}/>
                        </Table.Cell>
                        <Table.Cell collapsing>
                            <Icon name="check" circular color="green" style={{marginTop: "5px"}}
                                  onClick={() => {
                                      this.props.onBrainAreaChange(this.state.selectedBrainArea);
                                      this.setState({isInEditMode: false})
                                  }}/>
                        </Table.Cell>
                    </Table.Row>
                    {this.props.inheritedBrainArea && this.state.selectedBrainArea !== null ? (
                        <Table.Row>
                            <Table.Cell colspan={3}>
                                use injection:&nbsp;
                                <a onClick={() => {
                                    this.props.onBrainAreaChange(null);
                                    this.setState({selectedBrainArea: null, isInEditMode: false})
                                }}>
                                    {`${displayBrainArea(this.props.inheritedBrainArea)}`}
                                </a>
                            </Table.Cell>
                        </Table.Row>
                    ) : null}
                </Table.Body>
            </Table>
        );
    }
}

function filterBrainArea(option: DropdownItemProps, filterValue: string) {
    const labelTest = option.text.toString().toLowerCase();

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

const brainAreaDeepSearch = (options: DropdownItemProps[], query: string) => {
    const filterValue = query.toLowerCase();

    const optionsInList = filterValue ? options.filter(option => {
        return filterBrainArea(option, filterValue);
    }) : options;

    return optionsInList.sort((a, b) => {
        const labelA = a.text.toString().toLowerCase();
        const labelB = b.text.toString().toLowerCase();

        if (labelA === filterValue) {
            return -1;
        }

        if (labelB === filterValue) {
            return 1;
        }

        const parts = filterValue.split(/\s+/);

        const partsA = labelA.split(/\s+/);
        const partsB = labelB.split(/\s+/);

        const areaA = lookupBrainArea(a.value as string);
        if (!areaA) {
            return -1;
        }

        const areaB = lookupBrainArea(b.value as string);
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
};
