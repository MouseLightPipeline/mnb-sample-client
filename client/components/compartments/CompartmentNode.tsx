import * as React from "react";
import {List, SemanticICONS} from "semantic-ui-react";
import {ICompartmentNode} from "./Compartments";

interface ICompartmentsProps {
    compartmentNode: ICompartmentNode;
    selectedNode: ICompartmentNode;

    onToggle(node: ICompartmentNode): void;
    onSelect(node: ICompartmentNode): void;
}

interface ICompartmentsState {
}

export class CompartmentNode extends React.Component<ICompartmentsProps, ICompartmentsState> {
    private get IconName(): SemanticICONS {
        if (this.props.compartmentNode.toggled) {
            return "folder open";
        }

        return this.props.compartmentNode.children && this.props.compartmentNode.children.length > 0 ? "folder" : "file";
    }

    public renderContent() {
        if (this.props.compartmentNode === this.props.selectedNode) {
            return (
                <List.Header onClick={() => this.props.onSelect(this.props.compartmentNode)}>
                    {this.props.compartmentNode.name}
                </List.Header>
            );
        } else {
            return (
                <List.Description onClick={() => this.props.onSelect(this.props.compartmentNode)}>
                    {this.props.compartmentNode.name}
                </List.Description>
            );
        }
    }

    public render(): JSX.Element | null | false {
        let items = null;

        if (this.props.compartmentNode.toggled) {
            items = (
                <List.List>
                    {this.props.compartmentNode.children.map(c => (
                        <CompartmentNode key={c.name} compartmentNode={c} selectedNode={this.props.selectedNode}
                                         onToggle={this.props.onToggle}
                                         onSelect={this.props.onSelect}/>
                    ))}
                </List.List>
            );
        }

        return (
            <List.Item>
                <List.Icon name={this.IconName} onClick={() => this.props.onToggle(this.props.compartmentNode)}/>
                <List.Content>
                    {this.renderContent()}
                    {items}
                </List.Content>
            </List.Item>
        );
    }
}
