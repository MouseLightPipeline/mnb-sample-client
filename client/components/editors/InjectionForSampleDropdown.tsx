import * as React from "react";
import {graphql} from 'react-apollo';
import {GraphQLDataProps} from "react-apollo/lib/graphql";
import {displayInjection, IInjection} from "../../models/injection";
import {ISample} from "../../models/sample";
import {InjectionsForSampleQuery} from "../../graphql/injection";
import {Dropdown} from "semantic-ui-react";


interface InjectionsForSampleQueryProps {
    injections: IInjection[];
}

interface IInjectionForSampleSelectProps {
    sample: ISample;
    selectedInjection: IInjection;
    disabled?: boolean;

    onInjectionChange?(injection: IInjection): void;

    injectionsQuery?: InjectionsForSampleQueryProps & GraphQLDataProps;
}

@graphql(InjectionsForSampleQuery, {
    name: "injectionsQuery",
    options: ({sample}) => ({variables: {input: {sampleIds: [sample.id]}}, pollInterval: 5000}),
    skip: (ownProps) => ownProps.sample === null
})
export class InjectionsForSampleDropdown extends React.Component<IInjectionForSampleSelectProps, {}> {
    public render() {

        const injections = this.props.injectionsQuery && !this.props.injectionsQuery.loading ? this.props.injectionsQuery.injections : [];

        const items = injections.map(s => {
            return {value: s.id, text: displayInjection(s)}
        });

        return (
            <Dropdown search fluid selection options={items}
                      placeholder="Select injection..."
                      disabled={this.props.disabled}
                      value={this.props.selectedInjection ? this.props.selectedInjection.id : null}
                      onChange={(e, {value}) => {
                          this.props.onInjectionChange(injections.find(i => i.id === value) || null)
                      }}/>
        );
    }
}

