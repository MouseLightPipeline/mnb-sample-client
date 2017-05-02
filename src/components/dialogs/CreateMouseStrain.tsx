import * as React from "react";
import {Modal, Button, FormGroup, FormControl, ControlLabel, HelpBlock} from "react-bootstrap";

import {IMouseStrain} from "../../models/mouseStrain";

type ValidationState = "success" | "warning" | "error";

export interface ICreateMouseStrainDelegate {
    (mouseStrain: IMouseStrain): void;
}

interface ICreateMouseStrainDialogProps {
    show: boolean;

    onCreate(mouseStrain: IMouseStrain): void;
    onCancel(): void;
}

interface ICreateMouseStrainDialogState {
    mouseStrain?: IMouseStrain;
}

export class CreateMouseStrainDialog extends React.Component<ICreateMouseStrainDialogProps, ICreateMouseStrainDialogState> {
    public constructor(props: ICreateMouseStrainDialogProps) {
        super(props);

        this.state = {
            mouseStrain: {
                id: null,
                name: ""
            }
        }
    }

    private get isValidCreateState(): boolean {
        return this.state.mouseStrain.name.length > 0
    }

    private get nameValidationState(): ValidationState {
        return this.isValidCreateState ? "success" : "error";
    }

    private onNameChange(evt: any) {
        this.setState({mouseStrain: Object.assign(this.state.mouseStrain, {name: evt.target.value})})
    }

    private renderHelpBlock() {
        return this.state.mouseStrain.name.length > 0 ? null : "Name cannot be empty"
    }

    render() {
        return (
            <Modal show={this.props.show} onHide={this.props.onCancel} aria-labelledby="create-mouse-strain-dialog">
                <Modal.Header style={{backgroundColor: "#5bc0de", color: "white"}} closeButton>
                    <Modal.Title id="create-mouse-strain-dialog">Mouse Strain</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h4>Add a new mouse strain</h4>
                    <p>
                        New mouse strains will be accessible from any sample.
                    </p>
                    <FormGroup bsSize="sm" controlId="formBasicText" validationState={this.nameValidationState}>
                        <ControlLabel>Name</ControlLabel>
                        <FormControl type="text" value={this.state.mouseStrain.name}
                                     placeholder="enter name"
                                     onChange={(e: any) => this.onNameChange(e)}/>
                        <FormControl.Feedback />
                        <HelpBlock>{this.renderHelpBlock()}</HelpBlock>
                    </FormGroup>
                </Modal.Body>
                <Modal.Footer>
                    <Button bsSize="sm" onClick={this.props.onCancel}>Cancel</Button>
                    <Button bsSize="sm" bsStyle="success" disabled={!this.isValidCreateState}
                            onClick={() => this.props.onCreate(this.state.mouseStrain)}>Add</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}
