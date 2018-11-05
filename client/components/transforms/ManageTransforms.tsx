import * as React from "react";
import {Modal, Button, Tab} from "semantic-ui-react";

import {displaySample, ISample} from "../../models/sample";
import {AddTransformPanel} from "./AddTransformPanel";
import {EditTransformsPanel} from "./EditTransformsPanel";
import {TRANSFORM_TRACING_COUNT_QUERY, TransformTracingCountQuery} from "../../graphql/transform";

interface IManageTransformsProps {
    show: boolean;
    sample: ISample;

    onClose(): void;
}

interface IManageTransformsState {
    activeIndex: number;
}

export class ManageTransforms extends React.Component<IManageTransformsProps, IManageTransformsState> {
    public constructor(props: IManageTransformsProps) {
        super(props);

        this.state = {
            activeIndex: 0
        };
    }

    public render() {
        const panes = [
            {
                menuItem: "Add",
                render: () => (
                    <Tab.Pane as="div">
                        <AddTransformPanel sample={this.props.sample}
                                           onSelectManageTab={() => this.setState({activeIndex: 1})}/>
                    </Tab.Pane>
                )
            },
            {
                menuItem: "Manage",
                render: () => <Tab.Pane as="div">
                    <TransformTracingCountQuery query={TRANSFORM_TRACING_COUNT_QUERY} pollInterval={30000}
                                                variables={{ids: this.props.sample.registrationTransforms.map(t => t.id)}}>
                        {({loading, error, data}) => {
                            return (
                                <EditTransformsPanel sample={this.props.sample}
                                                     transformCounts={data.tracingCountsForRegistrations ? data.tracingCountsForRegistrations.counts : []}
                                                     onSelectAddTab={() => this.setState({activeIndex: 0})}/>
                            );
                        }}
                    </TransformTracingCountQuery>
                </Tab.Pane>
            }
        ];

        return (
            <Modal closeIcon centered={false} open={this.props.show} onClose={this.props.onClose} dimmer="blurring">
                <Modal.Header content={`Transforms for ${displaySample(this.props.sample)}`}/>
                <Modal.Content>
                    <Tab activeIndex={this.state.activeIndex}
                         menu={{secondary: true, pointing: true}}
                         panes={panes}
                         onTabChange={(e, {activeIndex}) => this.setState({activeIndex: activeIndex as number})}/>
                </Modal.Content>
                <Modal.Actions>
                    <Button color="blue" content="Close" onClick={this.props.onClose}/>
                </Modal.Actions>
            </Modal>
        );
    }
}
