import * as React from "react";
import {Input} from "semantic-ui-react";
import * as ReactDatePickerMod from "react-datepicker";
import * as moment from "moment";
import {Moment} from "moment";

const ReactDatePicker = ReactDatePickerMod.default;

export enum DynamicDatePickerMode {
    Static,
    Edit
}

export interface IDynamicDatePickerProps {
    initialValue: Date;
    isDeferredEditMode?: boolean;

    onChangeDate?(date: Date): void;
}

export interface IDynamicDatePickerState {
    // initialPropValue?: Moment;
    value?: Moment;
    mode?: DynamicDatePickerMode;
    userValue?: string;
}

export class DynamicDatePicker extends React.Component<IDynamicDatePickerProps, IDynamicDatePickerState> {
    constructor(props: IDynamicDatePickerProps) {
        super(props);

        this.state = {
            // initialPropValue: moment(props.initialValue),
            value: moment(props.initialValue),
            mode: DynamicDatePickerMode.Static,
            userValue: moment(props.initialValue).format("YYYY-MM-DD")
        };
    }

    private get isInEditMode() {
        return this.state.mode === DynamicDatePickerMode.Edit;
    }

    private get isDeferredEditMode() {
        return !(this.props.isDeferredEditMode === undefined || this.props.isDeferredEditMode === null) && this.props.isDeferredEditMode;
    }

    private onRequestEditMode = () => {
        this.setState({mode: DynamicDatePickerMode.Edit});
    };

    private onAcceptEdit = () => {
        this.setState({mode: DynamicDatePickerMode.Static});

        if (this.props.onChangeDate) {
            this.props.onChangeDate(this.state.value.toDate());
        }
    };

    private onCancelEdit = () => {
        this.setState({mode: DynamicDatePickerMode.Static, value: moment(this.props.initialValue)});
    };

    private handleChange = (date: any) => {
        console.log(date);
        this.setState({
            value: date.toDate()
        });

        if (this.isInEditMode && !this.isDeferredEditMode) {
            this.onAcceptEdit();
        }
    };

    public componentWillReceiveProps(props: IDynamicDatePickerProps) {
        this.setState({
            // initialPropValue: moment(props.initialValue),
            value: moment(props.initialValue)
        });
    }

    public render() {
        const style = {
            margin: "0px",
            display: "inline"
        };

        const CustomInput = (
            <Input size="mini" fluid type="text"
                   value={this.state.value}
                   label={{icon: "cancel", size: "mini", onClick: this.onCancelEdit}} labelPosition="left"
                   action={{
                       icon: "check",
                       color: "teal",
                       size: "mini",
                       onClick: this.onAcceptEdit
                   }}
                //onKeyPress={this.onKeyPress}
                //onChange={this.onValueChanged}
            />
        );

        if (this.isInEditMode) {
            if (!this.isDeferredEditMode) {
                return (
                    <ReactDatePicker
                        className="date-picker-input"
                        dateFormat="YYYY-MM-DD"
                        selected={this.state.value}
                        onChange={this.handleChange}
                    />
                );
            } else {
                return (
                    <ReactDatePicker
                        customInput={CustomInput}
                        selected={this.state.value}
                        onChange={this.handleChange}
                    />
                );
            }
        } else {
            return (
                <a onClick={this.onRequestEditMode}>
                    {`${moment(this.state.value).format("YYYY-MM-DD")}`}
                </a>
            )
        }
    }
}
