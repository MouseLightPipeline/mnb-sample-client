import * as React from "react";
import {FormGroup, InputGroup, Glyphicon, Button} from "react-bootstrap";
import Autosuggest = require("react-autosuggest");
import {isNullOrUndefined} from "util";

export enum DynamicAutoSuggestMode {
    Static,
    Edit
}

interface IObjectAutoSuggestProps<T> {
    items: T[];
    placeholder: string;
    displayProperty: string;
    initialValue: string;
    isDeferredEditMode?: boolean;
    isEditOnly?: boolean;
    placeHolder?: string;

    onChange?(value: string): void;
}

interface IObjectAutoSuggestState<T> {
    suggestions: T[];
    initialPropValue?: any;
    value?: string;
    mode?: DynamicAutoSuggestMode;
}

export class DynamicAutoSuggest<T extends any> extends React.Component<IObjectAutoSuggestProps<T>, IObjectAutoSuggestState<T>> {
    constructor(props: any) {
        super(props);

        this.state = {
            suggestions: [],
            initialPropValue: props.initialValue,
            value: props.initialValue,
            mode: DynamicAutoSuggestMode.Static
        };
    }

    private get isInEditMode() {
        return (this.props.isEditOnly) || this.state.mode === DynamicAutoSuggestMode.Edit;
    }

    private get isDeferredEditMode() {
        return !isNullOrUndefined(this.props.isDeferredEditMode) && this.props.isDeferredEditMode;
    }

    private onRequestEditMode() {
        this.setState({mode: DynamicAutoSuggestMode.Edit});
    }

    private onAcceptEdit() {
        this.setState({mode: DynamicAutoSuggestMode.Static});

        if (this.props.onChange) {
            this.props.onChange(this.state.value);
        }
    }

    private onCancelEdit() {
        this.setState({mode: DynamicAutoSuggestMode.Static, value: this.props.initialValue});
    }

    private onAutoSuggestInputChange(obj: any) {
        this.setState({
            value: obj.newValue
        });

        if (this.isInEditMode && !this.isDeferredEditMode) {
            if (this.props.onChange) {
                this.props.onChange(obj.newValue);
            }
        }
    };

    private getSuggestions(value: string): T[] {
        if (!this.props.items) {
            return [];
        }

        const inputValue = value.trim().toLowerCase();
        const inputLength = inputValue.length;

        return inputLength === 0 ? [] : this.props.items.filter(item => {
                return item[this.props.displayProperty].toLowerCase().indexOf(inputValue) > -1;
            }
        );
    }

    public componentWillReceiveProps(props: IObjectAutoSuggestProps<T>) {
        this.setState({
            initialPropValue: props.initialValue,
            value: props.initialValue
        }, null);
    }

    private renderClickableValue() {
        return (
            <a onClick={() => this.onRequestEditMode()}>
                {this.renderValue(this.state.value)}
            </a>
        )
    }

    protected renderValue(value: string) {
        if (isNullOrUndefined(value) || value.length === 0) {
            return (<span style={{color: "#AAA"}}>{this.props.placeHolder || "(none)"}</span>)
        }

        return value;
    }

    private renderAutoSuggest(isInputGroup: boolean = false) {
        const inputProps = {
            placeholder: this.props.placeholder,
            value: this.state.value || "",
            onChange: (event: any, obj: any) => this.onAutoSuggestInputChange(obj)
        };

        const theme = isInputGroup ? inputGroupTheme : standardTheme;

        const props = {
            theme: theme,
            suggestions: this.state.suggestions,
            onSuggestionsFetchRequested: (obj: any) => this.onSuggestionsFetchRequested(obj),
            onSuggestionsClearRequested: () => this.onSuggestionsClearRequested(),
            getSuggestionValue: (suggestion: any) => this.getSuggestionValue(suggestion),
            renderSuggestion: (suggestion: any) => this.renderSuggestion(suggestion),
            inputProps: inputProps
        };

        return (<Autosuggest {...props}/>);
    }

    // Use your imagination to render suggestions.
    private renderSuggestion(suggestion: T) {
        return (
            <div>
                {suggestion[this.props.displayProperty]}
            </div>
        );
    }

    // Autosuggest will call this function every time you need to update suggestions.
    // You already implemented this logic above, so just use it.
    private onSuggestionsFetchRequested({value}: any) {
        this.setState({
            suggestions: this.getSuggestions(value)
        });
    };

    // Autosuggest will call this function every time you need to clear suggestions.
    private onSuggestionsClearRequested() {
        this.setState({
            suggestions: []
        });
    }

    private getSuggestionValue(suggestion: T) {
        return suggestion ? suggestion[this.props.displayProperty] : "";
    }


    public render() {
        const style = {
            margin: "0px",
            display: "inline"
        };

        if (this.isInEditMode) {
            if (!this.isDeferredEditMode) {
                return this.renderAutoSuggest();
            } else {
                return (
                    <FormGroup bsSize="small" style={style}>
                        <InputGroup bsSize="sm">
                            <InputGroup.Button>
                                <Button onClick={() => this.onCancelEdit()}>
                                    <Glyphicon glyph="remove"/>
                                </Button>
                            </InputGroup.Button>
                            {this.renderAutoSuggest(true)}
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
            return this.renderClickableValue();
        }
    }
}

const standardTheme = {
    container: "react-autosuggest__container",
    containerOpen: "react-autosuggest__container--open",
    input: "react-autosuggest__input",
    inputOpen: "react-autosuggest__input--open",
    inputFocused: "react-autosuggest__input--focused",
    suggestionsContainer: "react-autosuggest__suggestions-container",
    suggestionsContainerOpen: "react-autosuggest__suggestions-container--open",
    suggestionsList: "react-autosuggest__suggestions-list",
    suggestion: "react-autosuggest__suggestion",
    suggestionFirst: "react-autosuggest__suggestion--first",
    suggestionHighlighted: "react-autosuggest__suggestion--highlighted",
    sectionContainer: "react-autosuggest__section-container",
    sectionContainerFirst: "react-autosuggest__section-container--first",
    sectionTitle: "react-autosuggest__section-title"
};

const inputGroupTheme = Object.assign({}, standardTheme, {input: "react-autosuggest__input_inputgroup"});