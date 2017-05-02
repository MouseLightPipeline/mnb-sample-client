import * as React from "react";
import {Glyphicon} from "react-bootstrap";
import {graphql, InjectedGraphQLProps} from 'react-apollo';
import gql from "graphql-tag";
import {toast} from "react-toastify";
const moment = require("moment");

import {IMutateSampleData, ISample, ISampleInput} from "../models/sample";
import {DynamicEditField, DynamicEditFieldMode} from "./util/DynamicEditField";
import {IRegistrationTransform} from "../models/registrationTransform";
import {displayInjection, IInjection} from "../models/injection";
import {MouseStrainSelect} from "./editors/MouseStrainSelect";
import {IMouseStrain} from "../models/mouseStrain";
import {DynamicDatePicker} from "./util/DynamicDatePicker";
import {RegistrationTransformSelectSelect} from "./editors/RegistrationTransformSelect";
import {ICreateMouseStrainDelegate} from "./dialogs/CreateMouseStrain";
import {ICreateRegistrationTransformDelegate} from "./dialogs/ManageRegistrationTransforms";

const tableRowStyle = {
    minHeight: "54px",
    height: "54px",
    fontSize: "14px"
};

const tableCellStyle = {
    verticalAlign: "middle"
};

const idTableCellStyle = Object.assign({}, tableCellStyle, {maxWidth: "80px"});
const editTableCellStyle = Object.assign({}, tableCellStyle, {maxWidth: "150px"});
const dateTableCellStyle = Object.assign({}, tableCellStyle, {maxWidth: "100px"});

const UpdateSampleMutation = gql`mutation UpdateSample($sample: SampleInput) {
  updateSample(sample: $sample) {
    sample {
        id
        idNumber
        animalId
        tag
        comment
        sampleDate
        mouseStrain {
          id
          name
        }
        injections {
          id
          brainArea {
            id
            name
          }
        }
        activeRegistrationTransform {
          id
          location
          name
        }
        registrationTransforms {
          id
          location
          name
        }
        updatedAt
    }
    error {
      message
    }
  }
}`;


interface ITracingsRowProps {
    mouseStrains: IMouseStrain[];
    sample: ISample;

    onRequestAddMouseStrain?(delegate: ICreateMouseStrainDelegate): void;
    onRequestAddRegistrationTransform?(forSample: ISample, delegate: ICreateRegistrationTransformDelegate): void;

    updateSampleMutation?(sample: ISampleInput): Promise<InjectedGraphQLProps<IMutateSampleData>>;
    // deleteSwcTracingMutation?(id: string): Promise<any>;
}

interface ITracingRowState {
    isEditingId?: boolean;
    isInUpdate?: boolean;
    showConfirmDelete?: boolean;
}

@graphql(UpdateSampleMutation, {
    props: ({mutate}) => ({
        updateSampleMutation: (sample: any) => mutate({
            variables: {sample}
        })
    })
})
export class SampleRow extends React.Component<ITracingsRowProps, ITracingRowState> {
    private _mouseStrainSelect: MouseStrainSelect;
    private _registrationTransformSelect: RegistrationTransformSelectSelect;

    public constructor(props: ITracingsRowProps) {
        super(props);

        this.state = {
            isEditingId: false,
            isInUpdate: false,
            showConfirmDelete: false
        }
    }

    private async performUpdate(samplePartial: ISampleInput) {
        try {
            const result = await this.props.updateSampleMutation(samplePartial);

            if (!result.data.updateSample.sample) {
                toast.error(updateErrorContent(result.data.updateSample.error), {autoClose: false});
            } else {
                toast.success(updateSuccessContent(), {autoClose: 3000});
            }
            this.setState({isInUpdate: false});
        } catch (error) {
            toast.error(updateErrorContent(error), {autoClose: false});

            this.setState({isInUpdate: false});

            return false;
        }

        return true;
    }

    private async onAcceptTagEdit(value: string): Promise<boolean> {
        return this.performUpdate({id: this.props.sample.id, tag: value});
    }

    private async onAcceptAnimalIdEdit(value: string): Promise<boolean> {
        return this.performUpdate({id: this.props.sample.id, animalId: value});
    }

    private async onAcceptIdNumberEdit(value: string): Promise<boolean> {
        return this.performUpdate({id: this.props.sample.id, idNumber: parseInt(value)});
    }

    private async onAcceptMouseStrainChange(mouseStrain: IMouseStrain) {
        return this.performUpdate({id: this.props.sample.id, mouseStrainId: mouseStrain ? mouseStrain.id : null});
    }

    private async onAcceptRegistrationTransformChange(registrationTransform: IRegistrationTransform) {
        return this.performUpdate({
            id: this.props.sample.id,
            activeRegistrationTransformId: registrationTransform ? registrationTransform.id : null
        });
    }

    private async onAcceptCommentEdit(value: string): Promise<boolean> {
        return this.performUpdate({id: this.props.sample.id, comment: value});
    }

    private async onAddRegistrationTransform() {
        if (this.props.onRequestAddRegistrationTransform) {
            this.props.onRequestAddRegistrationTransform(this.props.sample, (r) => this.onRegistrationTransformCreated(r));
        }
    }

    private async onRegistrationTransformCreated(registrationTransform: IRegistrationTransform): Promise<void> {
        await this.onAcceptRegistrationTransformChange(registrationTransform);
        this._registrationTransformSelect.isInEditMode = false;
    }


    private async onAddMouseStrain() {
        if (this.props.onRequestAddMouseStrain) {
            this.props.onRequestAddMouseStrain((m) => this.onMouseStrainCreated(m));
        }
    }

    private async onMouseStrainCreated(mouseStrain: IMouseStrain): Promise<void> {
        await this.onAcceptMouseStrainChange(mouseStrain);
        this._mouseStrainSelect.isInEditMode = false;
    }

    private onEditModeChanged(mode: DynamicEditFieldMode) {
        this.setState({isEditingId: mode === DynamicEditFieldMode.Edit});
    }

    private async onShowDeleteConfirmation() {
        /*
         this.setState({showConfirmDelete: true, isCountingTransforms: true, transformedCount: -1}, null);

         try {
         const out = await this.props.transformedTracingsForSwc(this.props.tracing.id);

         const contents = out.data.transformedTracingsForSwc;

         if (contents.error) {
         console.log(contents.error);
         }

         this.setState({isCountingTransforms: false, transformedCount: contents.count}, null);
         } catch (err) {
         this.setState({isCountingTransforms: false, transformedCount: -1}, null);
         console.log(err)
         }*/
    }

    /*

     private async onCloseConfirmation(shouldDelete = false) {
     this.setState({showConfirmDelete: false}, null);

     if (shouldDelete) {
     await this.deleteTracing();
     }
     }

     private async deleteTracing() {
     try {
     const result = await this.props.deleteSwcTracingMutation(this.props.tracing.id);

     if (result.data.deleteTracing.error) {
     toast.error(deleteErrorContent(result.data.deleteTracing.error), {autoClose: false});
     } else {
     toast.success(deleteSuccessContent(), {autoClose: 3000});

     if (this.props.refetch) {
     this.props.refetch();
     }
     }
     } catch (error) {
     toast.error(deleteErrorContent(error), {autoClose: false});
     }
     }

     private renderDeleteConfirmationCount() {
     if (this.state.isInUpdate) {
     return "Requesting registered tracing count for this swc...";
     }

     if (this.state.transformedCount < 0) {
     return (
     <p>
     <Label bsStyle="warning">warning</Label>
     <span style={{paddingLeft: "10px"}}>Could not retrieve tracing count for this swc</span>
     </p>
     );
     }

     switch (this.state.transformedCount) {
     case 0:
     return deleteModalCountContent(this.state.transformedCount, "There are no registered tracings associated with this swc.");
     case 1:
     return deleteModalCountContent(this.state.transformedCount, "There is 1 registered tracing associated with this swc.");
     default:
     return deleteModalCountContent(this.state.transformedCount, `There are ${this.state.transformedCount} registered tracings associated with this swc.`);
     }
     }
     */

    private renderInjections(injections: IInjection[]) {
        if (!injections || injections.length === 0) {
            return "(none)";
        }

        const rows = injections.map(i => (
            <tr key={`sil_${i.id}`}>
                <td>{displayInjection(i)}</td>
            </tr>)
        );

        return (
            <table>
                <tbody>
                {rows}
                </tbody>
            </table>
        );
    }

    public render() {
        const s = this.props.sample;

        if (!s) {
            return null;
        }

        return (
            <tr style={tableRowStyle}>{/*
             <Modal show={this.state.showConfirmDelete} onHide={() => this.onCloseConfirmation()}>
             <Modal.Header closeButton>
             <h4>Delete entry for {this.props.tracing.filename}?</h4>
             </Modal.Header>
             <Modal.Body>
             <h5>This action will also delete any registered tracings derived from this file.</h5>
             {this.renderDeleteConfirmationCount()}
             </Modal.Body>
             <Modal.Footer>
             <Button onClick={() => this.onCloseConfirmation()} style={{marginRight: "20px"}}>Cancel</Button>
             <Button onClick={() => this.onCloseConfirmation(true)} bsStyle="danger">Delete</Button>
             </Modal.Footer>
             </Modal>*/}
                <td style={idTableCellStyle}>
                    {!this.state.isEditingId ?
                        <a style={{paddingRight: "20px"}} onClick={() => this.onShowDeleteConfirmation()}>
                            <Glyphicon glyph="trash"/>
                        </a> : null
                    }
                    <DynamicEditField initialValue={s.idNumber} acceptFunction={v => this.onAcceptIdNumberEdit(v)}
                                      onEditModeChanged={(m: DynamicEditFieldMode) => this.onEditModeChanged(m)}/>
                </td>
                <td style={editTableCellStyle}>
                    <DynamicEditField initialValue={s.tag} placeHolder="(none)"
                                      acceptFunction={v => this.onAcceptTagEdit(v)}/>
                </td>
                <td style={editTableCellStyle}>
                    <DynamicEditField initialValue={s.animalId} placeHolder="(none)"
                                      acceptFunction={v => this.onAcceptAnimalIdEdit(v)}/>
                </td>
                <td style={dateTableCellStyle}>
                    <DynamicDatePicker initialValue={s.sampleDate} isDeferredEditMode={true}/>
                </td>
                <td style={tableCellStyle}>
                    <MouseStrainSelect idName="sample-mouse-strain"
                                       ref={(input) => this._mouseStrainSelect = input}
                                       options={this.props.mouseStrains}
                                       selectedOption={s.mouseStrain}
                                       placeholder="(none)"
                                       isDeferredEditMode={true}
                                       isExclusiveEditMode={false}
                                       onRequestAdd={this.props.onRequestAddMouseStrain ? () => this.onAddMouseStrain() : null}
                                       onSelect={s => this.onAcceptMouseStrainChange(s)}/>
                </td>
                <td style={tableCellStyle}>
                    <RegistrationTransformSelectSelect idName="sample-mouse-strain"
                                                       ref={(input) => this._registrationTransformSelect = input}
                                                       options={s.registrationTransforms}
                                                       selectedOption={s.activeRegistrationTransform}
                                                       placeholder="(none)"
                                                       isDeferredEditMode={true}
                                                       isExclusiveEditMode={false}
                                                       onRequestAdd={this.props.onRequestAddRegistrationTransform ? () => this.onAddRegistrationTransform() : null}
                                                       onSelect={s => this.onAcceptRegistrationTransformChange(s)}/>
                </td>
                <td style={tableCellStyle}>{this.renderInjections(s.injections)}</td>
                <td style={tableCellStyle}>
                    <DynamicEditField initialValue={s.comment} placeHolder="(none)"
                                      acceptFunction={v => this.onAcceptCommentEdit(v)}/>
                </td>
                <td style={tableCellStyle}>
                    {moment(s.createdAt).format("YYYY-MM-DD")}<br/>
                    {moment(s.createdAt).format("hh:mm:ss")}
                </td>
            </tr>
        );
    }
}

const updateSuccessContent = () => {
    return (<div><h3>Update successful</h3></div>);
};

const updateErrorContent = (error: Error) => {
    return (<div><h3>Update failed</h3>{error ? error.message : "(no additional details available)"}</div>);
};
