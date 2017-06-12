import * as React from "react";
import {graphql} from 'react-apollo';
import {GraphQLDataProps} from "react-apollo/lib/graphql";
import {IInjection} from "../../models/injection";
import {ISample} from "../../models/sample";
import {InjectionSelect} from "./InjectionSelect";
import {InjectionsForSampleQuery} from "../../graphql/injection";


interface InjectionsForSampleQueryProps {
    injections: IInjection[];
}

interface IInjectionForSampleSelectProps {
    sample: ISample;
    selectedInjection: IInjection;
    injectionsQuery?: InjectionsForSampleQueryProps & GraphQLDataProps;
    placeholder?: string;
    disabled?: boolean;

    onInjectionChange?(injection: IInjection): void;
}

interface IInjectionForSampleSelectState {
}

@graphql(InjectionsForSampleQuery, {
    name: "injectionsQuery",
    options: ({sample}) => ({variables: {input: {sampleIds: [sample.id]}}, pollInterval: 5000}),
    skip: (ownProps) => ownProps.sample === null
})
export class InjectionsForSampleSelect extends React.Component<IInjectionForSampleSelectProps, IInjectionForSampleSelectState> {
    public render() {

        const injections = this.props.injectionsQuery && !this.props.injectionsQuery.loading ? this.props.injectionsQuery.injections : [];

        return (
            <InjectionSelect idName="create-neuron-injection" options={injections}
                          selectedOption={this.props.selectedInjection}
                          disabled={this.props.disabled}
                          placeholder={this.props.placeholder}
                          onSelect={this.props.onInjectionChange}/>
        );
    }
}

