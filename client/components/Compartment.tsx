import * as React from "react";
import {List, Form, Button} from "semantic-ui-react";
import {graphql} from "react-apollo";

import {IBrainArea, IBrainAreaInput} from "../models/brainArea";
import {UpdateBrainAreaMutation} from "../graphql/brainAreas";
import {toast} from "react-toastify";
import {toastUpdateError, toastUpdateSuccess} from "ndb-react-components";

interface ICompartmentProps {
    compartment: IBrainArea;

    updateBrainArea?(input: IBrainAreaInput): any;
}

interface ICompartmentState {
    srcAliases?: string;
    aliases?: string;
    isInUpdate?: boolean;
}

@graphql(UpdateBrainAreaMutation, {
    props: ({mutate}) => ({
        updateBrainArea: (brainArea: IBrainAreaInput) => mutate({
            variables: {brainArea}
        })
    })
})
export class Compartment extends React.Component<ICompartmentProps, ICompartmentState> {
    public constructor(props: ICompartmentProps) {
        super(props);

        const simpleString = props.compartment.aliases.join(", ");

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
            const simpleString = props.compartment.aliases.join(", ");

            this.setState({
                srcAliases: simpleString,
                aliases: simpleString,
                isInUpdate: false
            })
        }
    }

    private async performUpdate() {
        try {
            const result = await this.props.updateBrainArea({
                id: this.props.compartment.id,
                aliases: this.state.aliases.length > 0 ? this.state.aliases.split(",").map(a => a.trim()) : null
            });

            if (!result.data.updateBrainArea.brainArea) {
                toast.error(toastUpdateError(result.data.updateBrainArea.error), {autoClose: false});
            } else {
                toast.success(toastUpdateSuccess(), {autoClose: 3000});
            }
            this.setState({isInUpdate: false});
        } catch (error) {
            toast.error(toastUpdateError(error), {autoClose: false});

            this.setState({isInUpdate: false});

            return false;
        }

        return true;
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
                            {this.props.compartment.aliases.length > 0 ?
                                <List.List as={"ul"}>{this.props.compartment.aliases.map((a, idx) => <List.Item as="li" value="•" style={{marginTop: "4px"}}
                                    key={idx}>{a}</List.Item>)}</List.List> :
                                <List.Description>(none)</List.Description>}
                        </List.Content>
                    </List.Item>
                </List>
                <Form>
                    <Form.Input fluid label="Update Aliases" value={this.state.aliases}
                                onChange={(e, {value}) => this.updateAliases(value)}/>
                    <Button disabled={this.state.aliases === this.state.srcAliases}
                            onClick={() => this.performUpdate()}>
                        Update
                    </Button>
                </Form>
            </div>
        );
    }
}
