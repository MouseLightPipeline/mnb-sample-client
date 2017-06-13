import * as React from "react";
import {Glyphicon, Modal, Button} from "react-bootstrap";
import {graphql, InjectedGraphQLProps} from 'react-apollo';
import {toast} from "react-toastify";
const moment = require("moment");

import {displaySample, IMutateSampleData, ISample, ISampleInput} from "../models/sample";
import {displayRegistrationTransform, IRegistrationTransform} from "../models/registrationTransform";
import {displayInjection, IInjection} from "../models/injection";
import {IMouseStrain} from "../models/mouseStrain";
import {FindVisibilityOption, IShareVisibilityOption, SampleVisibilityOptions} from "../util/ShareVisibility";
import {VisibilitySelect} from "./editors/VisibilitySelect";
import {DeleteSampleMutation, UpdateSampleMutation} from "../graphql/sample";
import {MouseStrainAutoSuggest} from "./editors/MouseStrainAutoSuggest";
import {
    DynamicDatePicker,
    DynamicEditField,
    DynamicEditFieldMode, toastDeleteError, toastDeleteSuccess, toastUpdateError,
    toastUpdateSuccess
} from "ndb-react-components";

const tableCellStyle = {verticalAlign: "middle"};
const idTableCellStyle = Object.assign({}, tableCellStyle, {maxWidth: "80px"});
const editTableCellStyle = Object.assign({}, tableCellStyle, {maxWidth: "150px"});
const dateTableCellStyle = Object.assign({}, tableCellStyle, {maxWidth: "130px"});

const ShareVisibilityOptions = SampleVisibilityOptions();

interface ISampleRowProps {
    mouseStrains: IMouseStrain[];
    sample: ISample;
    neuronCount: number;

    onRequestAddRegistrationTransform?(forSample: ISample): void;
    onRequestManageInjections?(forSample: ISample): void;

    updateSample?(sample: ISampleInput): Promise<InjectedGraphQLProps<IMutateSampleData>>;
    deleteSample?(sample: ISampleInput): any;
}

interface ISampleRowState {
    isEditingId?: boolean;
    isInUpdate?: boolean;
    showConfirmDelete?: boolean;
    isDeleted?: boolean;
}

@graphql(UpdateSampleMutation, {
    props: ({mutate}) => ({
        updateSample: (sample: ISampleInput) => mutate({
            variables: {sample}
        })
    })
})
@graphql(DeleteSampleMutation, {
    props: ({mutate}) => ({
        deleteSample: (sample: ISampleInput) => mutate({
            variables: {sample}
        })
    })
})
export class SampleRow extends React.Component<ISampleRowProps, ISampleRowState> {
    public constructor(props: ISampleRowProps) {
        super(props);

        this.state = {
            isEditingId: false,
            isInUpdate: false,
            showConfirmDelete: false,
            isDeleted: false
        }
    }

    private async performUpdate(samplePartial: ISampleInput) {
        try {
            const result = await this.props.updateSample(samplePartial);

            if (!result.data.updateSample.sample) {
                toast.error(toastUpdateError(result.data.updateSample.error), {autoClose: false});
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

    private async onAcceptTagEdit(value: string): Promise<boolean> {
        return this.performUpdate({id: this.props.sample.id, tag: value});
    }

    private async onAcceptAnimalIdEdit(value: string): Promise<boolean> {
        return this.performUpdate({id: this.props.sample.id, animalId: value});
    }

    private async onAcceptIdNumberEdit(value: string): Promise<boolean> {
        return this.performUpdate({id: this.props.sample.id, idNumber: parseInt(value)});
    }

    private async onDateChanged(value: Date): Promise<boolean> {
        return this.performUpdate({id: this.props.sample.id, sampleDate: value.valueOf()});
    }

    private async onAcceptMouseStrainChange(name: string) {
        return this.performUpdate({id: this.props.sample.id, mouseStrainName: name || null});
    }

    private async onAcceptCommentEdit(value: string): Promise<boolean> {
        return this.performUpdate({id: this.props.sample.id, comment: value});
    }

    private async onAcceptVisibility(visibility: IShareVisibilityOption): Promise<boolean> {
        return this.performUpdate({id: this.props.sample.id, sharing: visibility.id});
    }

    private async onAddRegistrationTransform() {
        if (this.props.onRequestAddRegistrationTransform) {
            this.props.onRequestAddRegistrationTransform(this.props.sample);
        }
    }

    private onEditModeChanged(mode: DynamicEditFieldMode) {
        this.setState({isEditingId: mode === DynamicEditFieldMode.Edit});
    }

    private async onShowDeleteConfirmation() {
        this.setState({showConfirmDelete: true}, null);
    }


    private async onCloseConfirmation(shouldDelete = false) {
        this.setState({showConfirmDelete: false}, null);

        if (shouldDelete) {
            await this.deleteSample();
        }
    }

    private async deleteSample() {
        try {
            const result = await this.props.deleteSample({id: this.props.sample.id});

            if (result.data.deleteSample.error) {
                toast.error(toastDeleteError(result.data.deleteSample.error), {autoClose: false});
            } else {
                toast.success(toastDeleteSuccess(), {autoClose: 3000});
                this.setState({isDeleted: true});
            }
        } catch (error) {
            toast.error(toastDeleteError(error), {autoClose: false});
        }
    }

    private renderDeleteConfirmationModal() {
        return (
            <Modal show={this.state.showConfirmDelete} onHide={() => this.onCloseConfirmation()}>
                <Modal.Header closeButton>
                    <h4>Delete Sample?</h4>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete the sample {displaySample(this.props.sample)}?
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => this.onCloseConfirmation()} style={{marginRight: "20px"}}>Cancel</Button>
                    <Button onClick={() => this.onCloseConfirmation(true)} bsStyle="danger">Delete</Button>
                </Modal.Footer>
            </Modal>
        );
    }

    private renderTransform(transform: IRegistrationTransform) {
        if (!transform) {
            return "(none)";
        }

        return displayRegistrationTransform(transform);
    }

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

        const count = this.props.neuronCount || 0;

        if (this.state.isDeleted) {
            return null;
        }

        return (
            <tr>
                {this.state.showConfirmDelete ? this.renderDeleteConfirmationModal() : null}
                <td style={idTableCellStyle}>
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
                    <DynamicDatePicker initialValue={new Date(s.sampleDate)} isDeferredEditMode={true}
                                       onChangeDate={(d) => this.onDateChanged(d)}/>
                </td>
                <td style={tableCellStyle}>
                    <MouseStrainAutoSuggest items={this.props.mouseStrains} displayProperty="name"
                                            placeholder="select or name a mouse strain"
                                            initialValue={s.mouseStrain ? s.mouseStrain.name : ""}
                                            isDeferredEditMode={true}
                                            onChange={(v: string) => this.onAcceptMouseStrainChange(v)}/>
                </td>
                <td style={tableCellStyle}>
                    <a onClick={() => this.onAddRegistrationTransform()}>
                        {this.renderTransform(s.activeRegistrationTransform)}
                    </a>
                </td>
                <td style={tableCellStyle}>
                    <a onClick={() => this.props.onRequestManageInjections(s)}>
                        {this.renderInjections(s.injections)}
                    </a>
                </td>
                <td style={tableCellStyle}>
                    <DynamicEditField initialValue={s.comment} placeHolder="(none)"
                                      acceptFunction={v => this.onAcceptCommentEdit(v)}/>
                </td>
                <td style={tableCellStyle}>
                    <VisibilitySelect idName="sample-visibility"
                                      options={ShareVisibilityOptions}
                                      selectedOption={FindVisibilityOption(s.sharing)}
                                      isDeferredEditMode={true}
                                      isExclusiveEditMode={false}
                                      onSelect={s => this.onAcceptVisibility(s)}/>
                </td>
                <td style={tableCellStyle}>
                    {count}
                </td>
                <td style={tableCellStyle}>
                    <div style={{display: "inline-block"}}>
                        {moment(s.createdAt).format("YYYY-MM-DD")}<br/>
                        {moment(s.createdAt).format("hh:mm:ss")}
                    </div>
                    {count === 0 ?
                        <a style={{paddingRight: "20px"}} className="pull-right"
                           onClick={() => this.onShowDeleteConfirmation()}>
                            <Glyphicon glyph="trash"/>
                        </a> : null
                    }
                </td>
            </tr>
        );
    }
}
