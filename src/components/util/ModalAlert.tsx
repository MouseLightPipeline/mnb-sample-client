import * as React from "react";
import {Modal, Button} from "react-bootstrap";

export type ModalAlertStyle = "default" | "success" | "info" | "warning" | "danger";

interface IModalAlertProps {
    show: boolean;
    style?: ModalAlertStyle;
    header?: React.Component<any, any> | string;
    message?: React.Component<any, any> | string;
    canCancel?: boolean;
    acknowledgeContent?: React.Component<any, any> | string;

    onCancel?(): void;
    onAcknowledge?(): void;
}

interface IModalAlertState {
}

export class ModalAlert extends React.Component<IModalAlertProps, IModalAlertState> {
    private renderHeader() {
        if (this.props.header) {
            if (this.props.header instanceof String || typeof this.props.header === "string") {
                return (
                    <Modal.Header closeButton>
                        <Modal.Title id="create-registration-dialog">{this.props.header}</Modal.Title>
                    </Modal.Header>
                );
            } else {
                return this.props.header;
            }
        } else {
            return null;
        }
    }

    private renderAcknowledge(alertStyle: ModalAlertStyle) {
        if (this.props.acknowledgeContent) {
            if (this.props.acknowledgeContent instanceof String || typeof this.props.acknowledgeContent === "string") {
                return (
                    <Button bsStyle={alertStyle} onClick={this.props.onAcknowledge}>
                        {this.props.acknowledgeContent}
                    </Button>
                );
            } else {
                return this.props.acknowledgeContent;
            }
        } else {
            return (<Button bsStyle={alertStyle} onClick={this.props.onAcknowledge}>Ok</Button>);
        }
    }

    public render() {
        const alertStyle = this.props.style || "default";

        return (
            <Modal show={this.props.show} onHide={this.props.onCancel}
                   aria-labelledby="create-registration-dialog">
                {this.renderHeader()}
                <Modal.Body>
                    {this.props.message}
                </Modal.Body>
                <Modal.Footer>
                    {this.props.canCancel ? <Button onClick={this.props.onCancel}>Cancel</Button> : null}
                    {this.renderAcknowledge(alertStyle)}
                </Modal.Footer>
            </Modal>
        );
    }
}
