import * as React from "react";
import {Button, Confirm, Header, Label, Table} from "semantic-ui-react";
import {toast} from "react-toastify";


import {FluorophoreAutoSuggest} from "../editors/FluorophoreAutoSuggest";
import {BrainAreaDropdown} from "../editors/BrainAreaDropdown";
import {
    toastCreateError,
    toastDeleteError,
    toastDeleteSuccess,
    toastUpdateError
} from "../elements/Toasts";

import {lookupBrainArea} from "../App";
import {ISample} from "../../models/sample";
import {IInjection} from "../../models/injection";
import {IBrainArea} from "../../models/brainArea";
import {VirusAutoSuggest} from "../editors/VirusAutoSuggest";
import {IFluorophore} from "../../models/fluorophore";
import {IInjectionVirus} from "../../models/injectionVirus";
import {
    DELETE_INJECTION_MUTATION,
    DeleteInjectionMutation,
    UPDATE_INJECTION_MUTATION,
    UpdateInjectionMutation, UpdateInjectionMutationData, UpdateInjectionMutationFn
} from "../../graphql/injection";

function onInjectionUpdated(data: UpdateInjectionMutationData) {
    if (!data.source || data.error) {
        toast.error(toastCreateError(data.error), {autoClose: false});
    }
}

interface IEditInjectionsPanelProps {
    sample: ISample;
    injections: IInjection[];
    injectionViruses: IInjectionVirus[];
    fluorophores: IFluorophore[];

    onSelectAddTab(): void;
}

interface IEditInjectionsState {
    isDeleteConfirmationShowing?: boolean;
    injectionToDelete?: IInjection;
    deletedInjections?: string[];
}

export class EditInjectionsPanel extends React.Component<IEditInjectionsPanelProps, IEditInjectionsState> {
    public constructor(props: IEditInjectionsPanelProps) {
        super(props);

        this.state = {
            isDeleteConfirmationShowing: false,
            injectionToDelete: null,
            deletedInjections: []
        };
    }

    private async onShowDeleteConfirmation(injectionToDelete: IInjection) {
        this.setState({isDeleteConfirmationShowing: true, injectionToDelete});
    }

    private onClearDeleteConfirmation() {
        this.setState({isDeleteConfirmationShowing: false, injectionToDelete: null});
    }

    private onInjectionDelete(data: any) {
        this.onClearDeleteConfirmation();

        if (!data.injection || data.error) {
            toast.error(toastDeleteError(data.error.message), {autoClose: false});
        } else {
            this.setState({deletedInjections: this.state.deletedInjections.concat([data.injection.id])});
            toast.success(toastDeleteSuccess());
        }
    }

    private onInjectionDeleteError = (error: Error) => {
        toast.error(toastDeleteError(error), {autoClose: false});
        this.onClearDeleteConfirmation();
    };

    private renderModalAlert() {
        if (!this.state.injectionToDelete) {
            return null;
        }

        return (
            <DeleteInjectionMutation mutation={DELETE_INJECTION_MUTATION} refetchQueries={["AppQuery"]}
                                     onCompleted={(data) => this.onInjectionDelete(data.deleteInjection)}
                                     onError={this.onInjectionDeleteError}>
                {(deleteInjection) => (
                    <Confirm open={this.state.isDeleteConfirmationShowing} header="Delete Injection" dimmer="blurring"
                             content={`Are you sure you want to delete the injection for ${this.state.injectionToDelete.brainArea.name}?`}
                             confirmButton="Delete" onCancel={() => this.onClearDeleteConfirmation()}
                             onConfirm={() => {
                                 deleteInjection({variables: {id: this.state.injectionToDelete.id}})
                             }}/>
                )}
            </DeleteInjectionMutation>
        )
    }

    private renderInjections(injections: IInjection[]) {
        const rows = injections.map(t => (
                <UpdateInjectionMutation mutation={UPDATE_INJECTION_MUTATION} key={t.id}
                                         onCompleted={(data) => onInjectionUpdated(data.updateInjection)}
                                         onError={(error) => toast.error(toastUpdateError(error), {autoClose: false})}>
                    {(updateInjection) => (
                        <Table.Row key={t.id}>
                            <Table.Cell>
                                <BrainAreaDropdown brainArea={lookupBrainArea(t.brainArea.id)}
                                                   onBrainAreaChange={(brainArea: IBrainArea) => onAcceptBrainArea(t, brainArea, updateInjection)}/>
                            </Table.Cell>
                            <Table.Cell>
                                <VirusAutoSuggest items={this.props.injectionViruses} displayProperty="name"
                                                  placeholder="select or name a new virus"
                                                  initialValue={t.injectionVirus.name}
                                                  isDeferredEditMode={true}
                                                  onChange={(v: string) => onVirusChanged(t, v, updateInjection)}/>
                            </Table.Cell>
                            <Table.Cell>
                                <FluorophoreAutoSuggest items={this.props.fluorophores} displayProperty="name"
                                                        placeholder="select or name a new fluorophore"
                                                        initialValue={t.fluorophore.name}
                                                        isDeferredEditMode={true}
                                                        onChange={(v: string) => onFluorophoreChanged(t, v, updateInjection)}/>
                            </Table.Cell>
                            <Table.Cell style={{minWidth: "120px"}}>
                                {t.neurons.length === 0 ?
                                    <Button icon="trash" color="red" size="mini" content="delete" labelPosition="left"
                                            onClick={() => this.onShowDeleteConfirmation(t)}/> :
                                    <Label>{t.neurons.length}<Label.Detail>neurons</Label.Detail></Label>
                                }
                            </Table.Cell>
                        </Table.Row>
                    )}
                </UpdateInjectionMutation>
            )
        );

        return (
            <div>
                <Header>
                    Modify and Delete Injections
                    <Header.Subheader>
                        <p>
                            You may not delete injections that are associated with neurons.
                        </p>
                        <p>
                            Modifying an injection should <span style={emp}>only</span> be done to correct errors. You
                            can <span style={emp}><a
                            onClick={() => this.props.onSelectAddTab()}>add a new injection</a></span> if there are
                            multiple
                            injections for the sample.
                        </p>
                    </Header.Subheader>
                </Header>
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Location</Table.HeaderCell>
                            <Table.HeaderCell>Virus</Table.HeaderCell>
                            <Table.HeaderCell>Fluorophore</Table.HeaderCell>
                            <Table.HeaderCell/>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {rows}
                    </Table.Body>
                </Table>
                {this.renderModalAlert()}
            </div>
        );
    }

    private renderNoInjections() {
        return (
            <Header>
                Edit and Remove Injections
                <Header.Subheader>
                    There are no injections for this sample. You can <a
                    onClick={() => this.props.onSelectAddTab()}> Add new injections here</a>
                </Header.Subheader>
            </Header>
        );
    }

    public render() {
        const injections = this.props.injections.filter(i => this.state.deletedInjections.find(id => id === i.id) === undefined);

        return injections.length > 0 ? this.renderInjections(injections) : this.renderNoInjections();
    }
}


async function onAcceptBrainArea(injection: IInjection, brainArea: IBrainArea, updateFn: UpdateInjectionMutationFn) {
    let brainAreaId = undefined;

    if (brainArea) {
        if (!injection.brainArea || injection.brainArea.id !== brainArea.id) {
            brainAreaId = brainArea.id;
        }
    } else if (injection.brainArea) {
        brainAreaId = null;
    }

    if (brainAreaId !== undefined) {
        await updateFn({variables: {injectionInput: {id: injection.id, brainAreaId}}});
    }
}

async function onFluorophoreChanged(injection: IInjection, value: string, updateFn: UpdateInjectionMutationFn) {
    if (value !== injection.fluorophore.name) {
        await updateFn({variables: {injectionInput: {id: injection.id, fluorophoreName: value}}});
    }
}

async function onVirusChanged(injection: IInjection, value: string, updateFn: UpdateInjectionMutationFn) {
    if (value !== injection.injectionVirus.name) {
        await updateFn({variables: {injectionInput: {id: injection.id, injectionVirusName: value}}});
    }
}

const emp = {
    fontWeight: "bold" as "bold" | 100,
    textDecoration: "underline"
};
