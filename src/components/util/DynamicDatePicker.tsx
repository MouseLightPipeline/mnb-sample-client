import * as React from "react";
import {FormGroup, InputGroup, Glyphicon, Button} from "react-bootstrap";
import * as ReactDatePickerMod from "react-datepicker";
import * as moment from "moment";
import {isNullOrUndefined} from "util";

const ReactDatePicker = ReactDatePickerMod.default;

export enum DynamicDatePickerMode {
    Static,
    Edit
}

interface IDynamicDatePickerProps {
    initialValue: Date;
    isDeferredEditMode?: boolean;

    onChangeDate?(date: Date): void;
}

interface IDynamicDatePickerState {
    initialPropValue?: any;
    value?: Date;
    mode?: DynamicDatePickerMode;
}

export class DynamicDatePicker extends React.Component<IDynamicDatePickerProps, IDynamicDatePickerState> {
    constructor(props: IDynamicDatePickerProps) {
        super(props);

        this.state = {
            initialPropValue: props.initialValue,
            value: props.initialValue,
            mode: DynamicDatePickerMode.Static
        };
    }

    private get isInEditMode() {
        return this.state.mode === DynamicDatePickerMode.Edit;
    }

    private get isDeferredEditMode() {
        return !isNullOrUndefined(this.props.isDeferredEditMode) && this.props.isDeferredEditMode;
    }

    private onRequestEditMode() {
        this.setState({mode: DynamicDatePickerMode.Edit}, null);
    }

    private onAcceptEdit() {
        this.setState({mode: DynamicDatePickerMode.Static});

        if (this.props.onChangeDate) {
            this.props.onChangeDate(this.state.value);
        }
    }

    private onCancelEdit() {
        this.setState({mode: DynamicDatePickerMode.Static, value: this.props.initialValue}, null);
    }

    private handleChange(date: any) {
        this.setState({
            value: date.toDate()
        });

        if (this.isInEditMode && !this.isDeferredEditMode) {
            this.onAcceptEdit();
        }
    }

    public componentWillReceiveProps(props: IDynamicDatePickerProps) {
        this.setState({
            initialPropValue: props.initialValue,
            value: props.initialValue
        }, null);
    }

    private renderClickableDate() {
        return (
            <a onClick={() => this.onRequestEditMode()}>
                {`${moment(this.state.value).format("YYYY-MM-DD")}`}
            </a>
        )
    }

    private renderDatePicker() {
        return (
            <ReactDatePicker
                className="date-picker-input"
                dateFormat="YYYY-MM-DD"
                selected={moment(this.state.value)}
                onChange={(d) => this.handleChange(d)}
            />
        );
    }

    public render() {
        const style = {
            margin: "0px",
            display: "inline"
        };

        if (this.isInEditMode) {
            if (!this.isDeferredEditMode) {
                return this.renderDatePicker();
            } else {
                return (
                    <FormGroup bsSize="small" style={style}>
                        <InputGroup bsSize="sm">
                            <InputGroup.Button>
                                <Button onClick={() => this.onCancelEdit()}>
                                    <Glyphicon glyph="remove"/>
                                </Button>
                            </InputGroup.Button>
                            {this.renderDatePicker()}
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
            return this.renderClickableDate();
        }
    }
}
