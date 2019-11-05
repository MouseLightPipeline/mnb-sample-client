import * as React from "react";
import {List, Form, Button} from "semantic-ui-react";
import {toast} from "react-toastify";

import {IBrainArea} from "../../models/brainArea";
import {toastCreateError, toastUpdateError, toastUpdateSuccess} from "../elements/Toasts";
import {
    UPDATE_COMPARTMENT_MUTATION,
    UpdateCompartmentMutation,
    UpdateCompartmentMutationData
} from "../../graphql/compartment";
import {UpdateSampleMutationData} from "../../graphql/sample";

interface ICompartmentProps {
    compartment: IBrainArea;
}

interface ICompartmentState {
    srcAliases?: string;
    aliases?: string;
    isInUpdate?: boolean;
}

export class Compartment extends React.Component<ICompartmentProps, ICompartmentState> {
    public constructor(props: ICompartmentProps) {
        super(props);

        const simpleString = props.compartment.aliasList.join(", ");

        this.state = {
            srcAliases: simpleString,
            aliases: simpleString,
            isInUpdate: false
        };
    }

    private updateAliases(value: string) {
        this.setState({aliases: value});
    }

    public componentWillReceiveProps(props: ICompartmentProps) {
        if (this.props.compartment !== null && this.props.compartment !== props.compartment) {
            const simpleString = props.compartment.aliasList.join(", ");

            this.setState({
                srcAliases: simpleString,
                aliases: simpleString,
                isInUpdate: false
            })
        }
    }

    public render() {
        if (this.props.compartment === null) {
            return null;
        }

        return (
            <div>
                <List>
                    <List.Item>
                        <List.Content>
                            <List.Header>
                                Name
                            </List.Header>
                            <List.Description>
                                {this.props.compartment.name}
                            </List.Description>
                        </List.Content>
                    </List.Item>
                    <List.Item>
                        <List.Content>
                            <List.Header>
                                Safe Name
                            </List.Header>
                            <List.Description>
                                {this.props.compartment.safeName}
                            </List.Description>
                        </List.Content>
                    </List.Item>
                    <List.Item>
                        <List.Content>
                            <List.Header>
                                Acronym
                            </List.Header>
                            <List.Description>
                                {this.props.compartment.acronym}
                            </List.Description>
                        </List.Content>
                    </List.Item>
                    <List.Item>
                        <List.Content>
                            <List.Header>
                                Current Aliases
                            </List.Header>
                            {this.props.compartment.aliasList.length > 0 ?
                                <List.List as={"ul"}>{this.props.compartment.aliasList.map((a, idx) => <List.Item
                                    as="li"
                                    value="•"
                                    style={{marginTop: "4px"}}
                                    key={idx}>{a}</List.Item>)}</List.List> :
                                <List.Description>(none)</List.Description>}
                        </List.Content>
                    </List.Item>
                </List>
                <Form>
                    <Form.Input fluid label="Update Aliases" value={this.state.aliases}
                                onChange={(e, {value}) => this.updateAliases(value)}/>
                    <UpdateCompartmentAliasesButton aliases={this.state.aliases} srcAliases={this.state.srcAliases}
                                                    compartmentId={this.props.compartment.id}/>
                </Form>
            </div>
        );
    }
}

interface IUpdateCompartmentAliasesButtonProps {
    aliases: string;
    srcAliases: string;
    compartmentId: string;
}

const UpdateCompartmentAliasesButton = (props: IUpdateCompartmentAliasesButtonProps) => (
    <UpdateCompartmentMutation mutation={UPDATE_COMPARTMENT_MUTATION}
                               onCompleted={(data) => onCompartmentUpdated(data.updateBrainArea)}
                               onError={(error) => toast.error(toastUpdateError(error), {autoClose: false})}>
        {(updateBrainArea) => {
            return (
                <Button icon="check" labelPosition="right" color="green" content="Update"
                        disabled={props.aliases === props.srcAliases}
                        onClick={() => updateBrainArea({
                            variables: {
                                brainArea: {
                                    id: props.compartmentId,
                                    aliasList: props.aliases.length > 0 ? props.aliases.split(",").map(a => a.trim()).filter(a => a.length > 0) : null
                                }
                            }
                        })}>
                </Button>
            );
        }}
    </UpdateCompartmentMutation>
);


function onCompartmentUpdated(data: UpdateCompartmentMutationData) {
    if (!data.source || data.error) {
        toast.error(toastCreateError(data.error), {autoClose: false});
    } else {
        toast.success(toastUpdateSuccess(), {autoClose: 3000});
    }
}