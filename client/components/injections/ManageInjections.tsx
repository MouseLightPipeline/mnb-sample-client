import * as React from "react";
import {Button, Icon, Modal, Tab, Message} from "semantic-ui-react";

import {AddInjectionPanel} from "./AddInjectionPanel";
import {EditInjectionsPanel} from "./EditInjections";
import {displaySample, ISample} from "../../models/sample";
import {
    INJECTIONS_FOR_SAMPLE_QUERY,
    InjectionsForSampleQuery
} from "../../graphql/injection";
import {IInjection} from "../../models/injection";
import {IInjectionVirus} from "../../models/injectionVirus";
import {IFluorophore} from "../../models/fluorophore";

interface IManageInjectionsContentProps {
    sample: ISample;
    injections: IInjection[];
    injectionViruses: IInjectionVirus[];
    fluorophores: IFluorophore[];

    refetch(): any;
}

interface IManageInjectionsContentState {
    injections?: IInjection[];
    activeIndex?: number;
}

class ManageInjectionsContent extends React.Component<IManageInjectionsContentProps, IManageInjectionsContentState> {
    public constructor(props: IManageInjectionsContentProps) {
        super(props);

        this.state = {
            activeIndex: 0,
            injections: null
        };
    }

    public componentWillReceiveProps(props: IManageInjectionsContentProps) {
        if (props.injections) {
            this.setState({injections: props.injections});
        }
    }

    public render() {
        if (this.state.injections === null) {
            return (
                <Message icon>
                    <Icon name="circle notched" loading/>
                    <Message.Content>
                        <Message.Header content="Loading Injections"/>
                        We are loading known injections for {displaySample(this.props.sample)}.
                    </Message.Content>
                </Message>
            );
        }
        const panes = [
            {
                menuItem: "Add",
                render: () => (
                    <Tab.Pane as="div">
                        <AddInjectionPanel sample={this.props.sample}
                                           fluorophores={this.props.fluorophores}
                                           injectionViruses={this.props.injectionViruses}
                                           refetch={this.props.refetch}/>
                    </Tab.Pane>
                )
            },
            {
                menuItem: "Manage",
                render: () => <Tab.Pane as="div">
                    <EditInjectionsPanel sample={this.props.sample}
                                         fluorophores={this.props.fluorophores}
                                         injectionViruses={this.props.injectionViruses}
                                         injections={this.props.injections}
                                         onSelectAddTab={() => this.setState({activeIndex: 0})}/>
                </Tab.Pane>
            },
        ];
        return (
            <Tab activeIndex={this.state.activeIndex}
                 menu={{secondary: true, pointing: true}}
                 panes={panes}
                 onTabChange={(e, {activeIndex}) => this.setState({activeIndex: activeIndex as number})}/>
        )
    }
}

interface IManageInjectionsProps {
    show: boolean;
    sample: ISample;

    onClose(): void;
}

interface IManageInjectionsState {
    activeIndex: number;
}

export class ManageInjections extends React.Component<IManageInjectionsProps, IManageInjectionsState> {
    public constructor(props: IManageInjectionsProps) {
        super(props);

        this.state = {
            activeIndex: 0
        };
    }

    public render() {
        return (
            <Modal closeIcon centered={false} open={this.props.show} onClose={this.props.onClose} dimmer="blurring">
                <Modal.Header content={`Injections for ${displaySample(this.props.sample)}`}/>
                <Modal.Content>
                    <InjectionsForSampleQuery query={INJECTIONS_FOR_SAMPLE_QUERY} pollInterval={5000}
                                              variables={{input: {sampleIds: [this.props.sample.id]}}}>
                        {({data, refetch}) => {
                            return (
                                <ManageInjectionsContent sample={this.props.sample} injections={data.injections} injectionViruses={data.injectionViruses} fluorophores={data.fluorophores} refetch={refetch}/>
                            );
                        }}
                    </InjectionsForSampleQuery>
                </Modal.Content>
                <Modal.Actions>
                    <Button color="blue" content="Close" onClick={this.props.onClose}/>
                </Modal.Actions>
            </Modal>
        );
    }
}