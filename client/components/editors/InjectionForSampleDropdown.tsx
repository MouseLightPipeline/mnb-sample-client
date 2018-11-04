import * as React from "react";
import {Dropdown} from "semantic-ui-react";

import {displayInjection, IInjection} from "../../models/injection";
import {ISample} from "../../models/sample";
import {INJECTIONS_FOR_SAMPLE_QUERY, InjectionsForSampleQuery} from "../../graphql/injection";

interface IInjectionForSampleSelectProps {
    sample: ISample;
    selectedInjection: IInjection;
    disabled?: boolean;

    onInjectionChange?(injection: IInjection): void;
}

export class InjectionsForSampleDropdown extends React.Component<IInjectionForSampleSelectProps, {}> {
    public render() {
        return (
            <InjectionsForSampleQuery query={INJECTIONS_FOR_SAMPLE_QUERY} pollInterval={5000}
                                      variables={{input: {sampleIds: this.props.sample ? [this.props.sample.id] : []}}}>
                {({loading, error, data}) => {
                    const items = data.injections ? data.injections.map(s => {
                        return {value: s.id, text: displayInjection(s)}
                    }) : [];

                    return (
                        <Dropdown search fluid selection options={items}
                                  placeholder="Select injection..."
                                  disabled={this.props.disabled}
                                  value={this.props.selectedInjection ? this.props.selectedInjection.id : null}
                                  onChange={(e, {value}) => {
                                      this.props.onInjectionChange(data.injections.find(i => i.id === value) || null)
                                  }}/>
                    );
                }}
            </InjectionsForSampleQuery>
        );
    }
}

