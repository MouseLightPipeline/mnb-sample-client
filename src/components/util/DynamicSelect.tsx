import * as React from "react";
import * as ReactSelectClass from "react-select";
import {FormGroup, InputGroup, Glyphicon, Button} from "react-bootstrap";
import {isNullOrUndefined} from "util";

import * as rv from "react-virtualized"; // No react-virtualized-select declaration to pull in - keep
import VirtualizedSelect from "react-virtualized-select"
import {Option} from "react-select";

interface IDynamicSelectOption {
    id?: string;
}

interface IDynamicSelectProps<T, S> {
    idName: string;
    isExclusiveEditMode?: boolean;
    isDeferredEditMode?: boolean;
    options: T[];
    selectedOption: S;
    disabled?: boolean;
    placeholder?: string;
    multiSelect?: boolean;
    clearable?: boolean;
    useVirtualized?: boolean;

    filterOptions?(options: Option[], filterValue: string, currentValues: Option[]): Option[];
    filterOption?(option: string, filter: string): boolean;
    onSelect(option: S): void;
    onRequestAdd?(): void;
}

interface IDynamicSelectState<T> {
    isInEditMode?: boolean;
    selectedOption?: T;
}

class DynamicSelect<T, S, P> extends React.Component<IDynamicSelectProps<T, S>, IDynamicSelectState<S>> {

    public constructor(props: IDynamicSelectProps<T, S>) {
        super(props);

        this.state = {isInEditMode: false, selectedOption: props.selectedOption};
    }

    protected findSelectedObject(option: P): S {
        return null;
    }

    private onSelectChange(option: P) {
        const selectedObject: S = this.findSelectedObject(option);

        if (this.isExclusiveEditMode || !this.isDeferredEditMode) {
            if (this.props.onSelect) {
                this.props.onSelect(selectedObject);
            }
        } else {
            this.setState({selectedOption: selectedObject});
        }
    }

    private onAcceptEdit() {
        this.setState({isInEditMode: false});

        if (this.props.onSelect) {
            this.props.onSelect(this.state.selectedOption);
        }
    }

    private onCancelEdit() {
        this.setState({isInEditMode: false, selectedOption: this.props.selectedOption});
    }

    private onRequestEditMode() {
        this.setState({isInEditMode: true});
    }

    private get isExclusiveEditMode() {
        return (isNullOrUndefined(this.props.isExclusiveEditMode) || this.props.isExclusiveEditMode);
    }

    public get isInEditMode() {
        return this.isExclusiveEditMode || this.state.isInEditMode;
    }

    public set isInEditMode(b: boolean) {
        this.setState({isInEditMode: b});
    }

    private get isDeferredEditMode() {
        return !isNullOrUndefined(this.props.isDeferredEditMode) && this.props.isDeferredEditMode;
    }

    public componentWillReceiveProps(props: IDynamicSelectProps<T, S>) {
        // if (this.isExclusiveEditMode || !this.isInEditMode) {
            this.setState({selectedOption: props.selectedOption});
        // }
    }

    protected selectValueForOption(option: T): any {
        return option;
    }

    protected selectLabelForOption(option: T): any {
        return option.toString();
    }

    protected staticDisplayForOption(option: S): any {
        return option.toString();
    }

    protected isSelectedOption(object: T, selectedOption: S) {
        return false;
    }

    protected addToSelection(option: any, selection: any): any {
    }

    protected renderSelect(selected: Option, options: Option[]) {
        return this.props.useVirtualized ? (
            <VirtualizedSelect
                name={`${this.props.idName}-select`}
                placeholder={this.props.placeholder || "Select..."}
                value={selected}
                options={options}
                clearable={this.props.clearable}
                disabled={this.props.disabled}
                multi={this.props.multiSelect}
                style={{borderRadius: "0"}}
                filterOption={this.props.filterOption}
                onChange={(option: P) => this.onSelectChange(option)}
            />
        ) : (
            <ReactSelectClass
                name={`${this.props.idName}-select`}
                placeholder={this.props.placeholder || "Select..."}
                value={selected}
                options={options}
                clearable={this.props.clearable}
                disabled={this.props.disabled}
                multi={this.props.multiSelect}
                style={{borderRadius: "0"}}
                filterOption={this.props.filterOption}
                filterOptions={this.props.filterOptions}
                onChange={(option: P) => this.onSelectChange(option)}
            />
        );
    }

    private renderAddButton() {
        if (!this.props.onRequestAdd) {
            return null;
        }
        return (
            <InputGroup.Button>
                <Button bsStyle="info" onClick={() => this.props.onRequestAdd()}>
                    <Glyphicon glyph="plus"/>
                </Button>
            </InputGroup.Button>
        );
    }

    public render() {
        const style = {
            margin: "0px",
            display: "inline",
            height: "100%"
        };

        let selection: any = null;

        const options = this.props.options.map(o => {
            const option = {label: this.selectLabelForOption(o), value: this.selectValueForOption(o)};

            if (this.state.selectedOption && this.isSelectedOption(o, this.state.selectedOption)) {
                selection = this.addToSelection(option, selection);
            }

            return option;
        });

        if (this.isInEditMode) {
            if (!this.isDeferredEditMode) {
                return this.renderSelect(selection, options);
            } else {
                return (
                    <FormGroup style={style}>
                        <InputGroup bsSize="sm">
                            <InputGroup.Button>
                                <Button onClick={() => this.onCancelEdit()}>
                                    <Glyphicon glyph="remove"/>
                                </Button>
                            </InputGroup.Button>
                            {this.renderSelect(selection, options)}
                            {this.renderAddButton()}
                            <InputGroup.Button>
                                <Button bsStyle="success" onClick={() => this.onAcceptEdit()}>
                                    <Glyphicon glyph="ok"/>
                                </Button>
                            </InputGroup.Button>
                        </InputGroup>
                    </FormGroup>
                );
            }
        } else {
            return (
                <a onClick={() => this.onRequestEditMode()}>{this.staticDisplayForOption(this.props.selectedOption)}</a>
            );
        }
    }
}

export class DynamicSingleSelect<T extends IDynamicSelectOption> extends DynamicSelect<T, T, Option> {
    protected findSelectedObject(option: Option): T {
        return option ? this.props.options.filter(s => s.id === option.value)[0] : null;
    }

    protected selectValueForOption(option: T): string {
        return option.id;
    }

    protected staticDisplayForOption(option: T): any {
        if (isNullOrUndefined(option)) {
            return (<span style={{color: "#AAA"}}>{this.props.placeholder}</span>)
        }
        return this.selectLabelForOption(option);
    }

    protected isSelectedOption(object: T, selectedOption: T) {
        return object.id === selectedOption.id;
    }

    protected addToSelection(option: Option, selection: Option) {
        return option;
    }
}

export class DynamicMultiSelect<T extends IDynamicSelectOption> extends DynamicSelect<T, T[], Option[]> {
    protected findSelectedObject(option: Option[]): T[] {
        return option.map(o => {
            return this.props.options.find(s => s.id === o.value);
        });
    }

    protected selectValueForOption(option: T): string {
        return option.id;
    }

    protected staticDisplayForOption(option: T[]): any {
        return this.selectLabelForOption(option[0]);
    }

    protected isSelectedOption(object: T, selectedOption: T[]) {
        return (selectedOption.length > 0) && !isNullOrUndefined(selectedOption.find(s => s.id === object.id));
    }

    protected addToSelection(option: Option, selection: Option[]) {
        if (selection) {
            selection.push(option.value);
        } else {
            selection = [option.value]
        }
        return selection;
    }
}
