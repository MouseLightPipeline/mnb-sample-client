import * as React from "react";
import {Table, Dropdown, Label, Button, List} from "semantic-ui-react";
import {toast} from "react-toastify";

const moment = require("moment");

import {ISample} from "../../models/sample";
import {displayRegistrationTransform} from "../../models/registrationTransform";
import {displayInjection, IInjection} from "../../models/injection";
import {IMouseStrain} from "../../models/mouseStrain";
import {
    FindVisibilityOption,
    SampleVisibilityOptions,
    ShareVisibility
} from "../../util/ShareVisibility";
import {MouseStrainAutoSuggest} from "../editors/MouseStrainAutoSuggest";
import {DynamicEditField} from "../elements/DynamicEditField";
import {DynamicDatePicker} from "../elements/DynamicDatePicker";
import {toastCreateError, toastUpdateError} from "../elements/Toasts";
import {
    UPDATE_SAMPLE_MUTATION,
    UpdateSampleMutation,
    UpdateSampleMutationData,
    UpdateSampleMutationFn
} from "../../graphql/sample";

const ShareVisibilityOptions = SampleVisibilityOptions();

interface ISampleRowProps {
    mouseStrains: IMouseStrain[];
    sample: ISample;

    onRequestAddRegistrationTransform(forSample: ISample): void;
    onRequestManageInjections(forSample: ISample): void;
    onRequestDeleteSample(forSample: ISample): void;
}

export class SampleRow extends React.Component<ISampleRowProps, {}> {
    private async onAcceptTagEdit(value: string, updateFn: UpdateSampleMutationFn) {
        if (value !== this.props.sample.tag) {
            await updateFn({variables: {sample: {id: this.props.sample.id, tag: value}}});
        }
    }

    private async onAcceptAnimalIdEdit(value: string, updateFn: UpdateSampleMutationFn) {
        if (value !== this.props.sample.animalId) {
            await updateFn({variables: {sample: {id: this.props.sample.id, animalId: value}}});
        }
    }

    private async onAcceptIdNumberEdit(value: string, updateFn: UpdateSampleMutationFn) {
        const idNumber = parseInt(value);

        if (!isNaN(idNumber) && idNumber !== this.props.sample.idNumber) {
            await updateFn({variables: {sample: {id: this.props.sample.id, idNumber}}});
        }
    }

    private async onDateChanged(value: Date, updateFn: UpdateSampleMutationFn) {
        if (value.valueOf() !== this.props.sample.sampleDate) {
            await updateFn({variables: {sample: {id: this.props.sample.id, sampleDate: value.valueOf()}}});
        }
    }

    private async onAcceptMouseStrainChange(name: string, updateFn: UpdateSampleMutationFn) {
        if ((!this.props.sample.mouseStrain || name !== this.props.sample.mouseStrain.name) || (!name && this.props.sample.mouseStrain)) {
            await updateFn({variables: {sample: {id: this.props.sample.id, mouseStrainName: name || null}}});
        }
    }

    private async onAcceptCommentEdit(value: string, updateFn: UpdateSampleMutationFn) {
        if (value !== this.props.sample.comment) {
            await updateFn({variables: {sample: {id: this.props.sample.id, comment: value}}});
        }
    }

    private async onAcceptVisibility(visibility: ShareVisibility, updateFn: UpdateSampleMutationFn) {
        if (visibility !== this.props.sample.sharing) {
            await updateFn({variables: {sample: {id: this.props.sample.id, sharing: visibility}}});
        }
    }

    private async onAddRegistrationTransform() {
        if (this.props.onRequestAddRegistrationTransform) {
            this.props.onRequestAddRegistrationTransform(this.props.sample);
        }
    }

    private renderInjections(injections: IInjection[]) {
        if (!injections || injections.length === 0) {
            return "(none)";
        }

        const rows = injections.map(i => (
            <List.Item key={`sil_${i.id}`}>
                {displayInjection(i, 20)}
            </List.Item>)
        );

        return <List>{rows} </List>;
    }

    public render() {
        const s = this.props.sample;

        if (!s) {
            return null;
        }

        return (
            <UpdateSampleMutation mutation={UPDATE_SAMPLE_MUTATION}
                                  onCompleted={(data) => onSampleUpdated(data.updateSample)}
                                  onError={(error) => toast.error(toastUpdateError(error), {autoClose: false})}>
                {(updateSample) => (
                    <Table.Row>
                        <Table.Cell style={{minWidth: "120px"}}>
                            <DynamicEditField initialValue={s.idNumber}
                                              canAcceptFunction={(val) => !isNaN(parseInt(val))}
                                              acceptFunction={v => this.onAcceptIdNumberEdit(v, updateSample)}/>
                        </Table.Cell>

                        <Table.Cell style={{wordBreak: "break-all"}}>
                            <DynamicEditField initialValue={s.tag} placeHolder="(none)"
                                              acceptFunction={v => this.onAcceptTagEdit(v, updateSample)}/>
                        </Table.Cell>

                        <Table.Cell style={{minWidth: "150px"}}>
                            <DynamicEditField initialValue={s.animalId} placeHolder="(none)"
                                              acceptFunction={v => this.onAcceptAnimalIdEdit(v, updateSample)}/>
                        </Table.Cell>

                        <Table.Cell style={{minWidth: "170px", maxWidth: "180px"}}>
                            <DynamicDatePicker initialValue={new Date(s.sampleDate)} isDeferredEditMode={true}
                                               onChangeDate={(d) => this.onDateChanged(d, updateSample)}/>
                        </Table.Cell>

                        <Table.Cell style={{minWidth: "120px"}}>
                            <MouseStrainAutoSuggest items={this.props.mouseStrains} displayProperty="name"
                                                    placeholder="select or name a mouse strain"
                                                    initialValue={s.mouseStrain ? s.mouseStrain.name : ""}
                                                    isDeferredEditMode={true}
                                                    onChange={(v: string) => this.onAcceptMouseStrainChange(v, updateSample)}/>
                        </Table.Cell>


                        <Table.Cell style={{minWidth: "180px"}}>
                            <a onClick={() => this.onAddRegistrationTransform()}>
                                {s.activeRegistrationTransform ? displayRegistrationTransform(s.activeRegistrationTransform) : "(none)"}
                            </a>
                        </Table.Cell>

                        <Table.Cell style={{minWidth: "200px"}}>
                            <a onClick={() => this.props.onRequestManageInjections(s)}>
                                {this.renderInjections(s.injections)}
                            </a>
                        </Table.Cell>

                        <Table.Cell>
                            <DynamicEditField initialValue={s.comment} placeHolder="(none)"
                                              acceptFunction={v => this.onAcceptCommentEdit(v, updateSample)}/>
                        </Table.Cell>

                        <Table.Cell style={{minWidth: "100px"}}>
                            <Dropdown search fluid inline options={ShareVisibilityOptions}
                                      value={FindVisibilityOption(s.sharing).value}
                                      onChange={(e, {value}) => this.onAcceptVisibility(value as ShareVisibility, updateSample)}/>
                        </Table.Cell>

                        <Table.Cell style={{minWidth: "100px"}}>
                            <div style={{display: "inline-block"}}>
                                {moment(s.createdAt).format("YYYY-MM-DD")}<br/>
                            </div>
                        </Table.Cell>

                        <Table.Cell style={{minWidth: "120px"}}>
                            {s.neuronCount === 0 ?
                                <Button icon="trash" color="red" size="mini" content="delete" labelPosition="left"
                                        onClick={() => this.props.onRequestDeleteSample(s)}/> :
                                <Label>{s.neuronCount}<Label.Detail>neurons</Label.Detail></Label>
                            }
                        </Table.Cell>
                    </Table.Row>
                )}
            </UpdateSampleMutation>
        );
    }
}

function onSampleUpdated(data: UpdateSampleMutationData) {
    if (!data.sample || data.error) {
        toast.error(toastCreateError(data.error.message), {autoClose: false});
    }
}
