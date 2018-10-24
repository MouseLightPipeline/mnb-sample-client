import * as React from "react";
import {Modal, Button, Sizes} from "react-bootstrap";

export type ModalAlertStyle = "default" | "success" | "info" | "warning" | "danger";

export interface IModalAlertProps {
    modalId?: string;
    show: boolean;
    style?: ModalAlertStyle;
    bsSize?: Sizes;
    header?: React.Component<any, any> | string;
    message?: string;
    canCancel?: boolean;
    acknowledgeContent?: React.Component<any, any> | string;

    onCancel?(): void;
    onAcknowledge?(): void;
}

export interface IModalAlertState {
}

export class ModalAlert extends React.Component<IModalAlertProps, IModalAlertState> {
    private renderHeader() {
        if (this.props.header) {
            if (this.props.header instanceof String || typeof this.props.header === "string") {
                return (
                    <Modal.Header closeButton>
                        <Modal.Title id={this.props.modalId || "alert"}>{this.props.header}</Modal.Title>
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
        const bsSize = this.props.bsSize || null;

        return (
            <Modal show={this.props.show} onHide={this.props.onCancel} bsSize={bsSize} aria-labelledby={this.props.modalId || "alert"}>
                {this.renderHeader()}
                <Modal.Body>
                    {this.props.message}
                    {this.props.children}
                </Modal.Body>
                <Modal.Footer>
                    {this.props.canCancel ? <Button onClick={this.props.onCancel}>Cancel</Button> : null}
                    {this.renderAcknowledge(alertStyle)}
                </Modal.Footer>
            </Modal>
        );
    }
}
