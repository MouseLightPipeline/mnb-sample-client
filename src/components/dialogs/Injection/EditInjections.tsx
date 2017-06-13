import * as React from "react";
import {
    Table,
    Glyphicon,
    Alert
} from "react-bootstrap";
import {graphql} from 'react-apollo';
import {InjectedGraphQLProps} from "react-apollo/lib/graphql";
import {toast} from "react-toastify";

import {ISample} from "../../../models/sample";
import {
    DeleteInjectionMutation, NeuronCountsForInjectionsQuery,
    SampleForInjectionQuery, UpdateInjectionMutation
} from "../../../graphql/injection";
import {IInjection, IInjectionInput} from "../../../models/injection";
import {IBrainArea} from "../../../models/brainArea";
import {BrainAreas, lookupBrainArea} from "../../App";
import {BrainAreaSelect} from "../../editors/BrainAreaSelect";
import {VirusAutoSuggest} from "../../editors/VirusAutoSuggest";
import {IFluorophore} from "../../../models/fluorophore";
import {IInjectionVirus} from "../../../models/injectionVirus";
import {FluorophoreAutoSuggest} from "../../editors/FluorophoreAutoSuggest";
import {ModalAlert, toastUpdateError, toastUpdateSuccess} from "ndb-react-components";

interface ITracingCountQueryProps {
    neuronCountsForInjections: any;
}

interface IEditInjectionsProps extends InjectedGraphQLProps<ITracingCountQueryProps> {
    sample: ISample;
    injectionViruses: IInjectionVirus[];
    fluorophores: IFluorophore[];

    onSelectAddTab(): void;

    updateInjection?(injectionInput: IInjectionInput, sample: ISample): any;
    deleteInjection?(injectionInput: IInjectionInput, sample: ISample): any;
}

interface IEditInjectionsState {
    isDeleteConfirmationShowing?: boolean;
    injectionToDelete?: IInjection;
    lastDeleteError?: string;
    isInUpdate?: boolean;
}


@graphql(NeuronCountsForInjectionsQuery, {
    options: ({sample}) => ({
        pollInterval: 5000,
        variables: {
            ids: sample.injections.map((obj: IInjection) => obj.id)
        }
    }),
    skip: (ownProps) => !ownProps.sample || !ownProps.sample.injections
})
@graphql(UpdateInjectionMutation, {
    props: ({mutate}) => ({
        updateInjection: (injectionInput: IInjectionInput, sample: ISample) => mutate({
            variables: {injectionInput},
            refetchQueries: [{
                query: SampleForInjectionQuery,
                variables: {
                    id: sample.id
                }
            }]
        })
    })
})
@graphql(DeleteInjectionMutation, {
    props: ({mutate}) => ({
        deleteInjection: (injectionInput: IInjectionInput, sample: ISample) => mutate({
            variables: {injectionInput},
            refetchQueries: [{
                query: SampleForInjectionQuery,
                variables: {
                    id: sample.id
                }
            }]
        })
    })
})
export class EditInjectionsPanel extends React.Component<IEditInjectionsProps, IEditInjectionsState> {
    public constructor(props: IEditInjectionsProps) {
        super(props);

        this.state = {
            isDeleteConfirmationShowing: false,
            injectionToDelete: null,
            lastDeleteError: null,
            isInUpdate: false
        }
    }

    private async onAcceptBrainArea(injection: IInjection, brainArea: IBrainArea): Promise<boolean> {
        return this.performUpdate({id: injection.id, brainAreaId: brainArea ? brainArea.id : null});
    }

    private async onFluorophoreChanged(injection: IInjection, value: string): Promise<boolean> {
        return this.performUpdate({id: injection.id, fluorophoreName: value});
    }

    private async onVirusChanged(injection: IInjection, value: string): Promise<boolean> {
        return this.performUpdate({id: injection.id, injectionVirusName: value});
    }

    private async performUpdate(injectionPartial: IInjectionInput): Promise<boolean> {
        try {
            this.setState({isInUpdate: true});

            const result = await this.props.updateInjection(injectionPartial, this.props.sample);

            if (result.data.updateInjection.error) {
                toast.error(toastUpdateError(result.data.updateInjection.error), {autoClose: false});
            } else {
                toast.success(toastUpdateSuccess(), {autoClose: 3000});
                return true;
            }
        } catch (error) {
            toast.error(toastUpdateError(error), {autoClose: false});
        }

        this.setState({isInUpdate: false});

        return false;
    }

    private async onDeleteInjection() {
        if (!this.state.injectionToDelete) {
            console.log("Failed to find injection to delete after confirmation.");
            return;
        }

        let deleteError = null;

        try {
            const out = await this.props.deleteInjection({id: this.state.injectionToDelete.id}, this.props.sample);

            deleteError = out.data.deleteInjection.error ? out.data.deleteInjection.error.message : null;
        } catch (err) {
            deleteError = err.message;
        }

        this.onClearDeleteConfirmation(deleteError);
    }

    private async onShowDeleteConfirmation(injectionToDelete: IInjection) {
        this.setState({isDeleteConfirmationShowing: true, injectionToDelete});
    }

    private onClearDeleteConfirmation(deleteError: string = null) {
        this.setState({isDeleteConfirmationShowing: false, injectionToDelete: null, lastDeleteError: deleteError});
    }

    private renderAlert() {
        const haveInjectionError = !this.props.data.loading && this.props.data.neuronCountsForInjections.error !== null;

        if (haveInjectionError) {
            return (
                <Alert bsStyle="danger">
                    <div>
                        <h4>Could not determine injection usage</h4>
                        {this.props.data.neuronCountsForInjections.error.message}
                    </div>
                </Alert>
            );
        }

        const haveDeleteError = this.state.lastDeleteError !== null;

        if (haveDeleteError) {
            return (
                <Alert bsStyle="danger">
                    <div>
                        <h4>Delete Error</h4>
                        {this.state.lastDeleteError}
                    </div>
                </Alert>
            );
        }
    }

    private renderModalAlert() {
        if (!this.state.injectionToDelete) {
            return null;
        }

        return (
            <ModalAlert show={this.state.isDeleteConfirmationShowing} style="danger" header="Delete Injection"
                        message={`Are you sure you want to delete the injection for ${this.state.injectionToDelete.brainArea.name}?`}
                        acknowledgeContent="Delete" canCancel={true} onCancel={() => this.onClearDeleteConfirmation()}
                        onAcknowledge={() => this.onDeleteInjection()}/>
        )
    }

    private renderInjections() {
        let counts: any = {};

        const haveData = !this.props.data.loading && this.props.data.neuronCountsForInjections.error === null;

        if (!this.props.data.loading) {
            counts = this.props.data.neuronCountsForInjections.counts.reduce((prev: any, curr: any) => {
                prev[curr.injectionId] = curr.count;

                return prev;
            }, {});
        }

        const rows = this.props.sample.injections.map(t => {
            const count = counts[t.id] ? counts[t.id] : 0;

            const canDelete = count === 0 && haveData;

            return (
                <tr key={t.id}>
                    <td>
                        <BrainAreaSelect idName="brain-area"
                                         options={BrainAreas}
                                         selectedOption={lookupBrainArea(t.brainArea.id)}
                                         multiSelect={false}
                                         isDeferredEditMode={true}
                                         isExclusiveEditMode={false}
                                         placeholder="select..."
                                         onSelect={(brainArea: IBrainArea) => this.onAcceptBrainArea(t, brainArea)}/>
                    </td>
                    <td>
                        <VirusAutoSuggest items={this.props.injectionViruses} displayProperty="name"
                                          placeholder="select or name a new virus"
                                          initialValue={t.injectionVirus.name}
                                          isDeferredEditMode={true}
                                          onChange={(v: string) => this.onVirusChanged(t, v)}/>
                    </td>
                    <td>
                        <FluorophoreAutoSuggest items={this.props.fluorophores} displayProperty="name"
                                                placeholder="select or name a new fluorophore"
                                                initialValue={t.fluorophore.name}
                                                isDeferredEditMode={true}
                                                onChange={(v: string) => this.onFluorophoreChanged(t, v)}/>
                    </td>
                    <td>
                        {haveData ? count || 0 : "?"}
                        {canDelete ?
                            <a style={{paddingRight: "20px"}} className="pull-right"
                               onClick={() => this.onShowDeleteConfirmation(t)}>
                                <Glyphicon glyph="trash"/>
                            </a>
                            : null}
                    </td>
                </tr>
            )
        });

        return (
            <div>
                <p>
                    You may not remove injections that are associated with neurons (see Neurons column).
                </p>
                <p>
                    Modifying an injection should only be done to correct errors. You can <a
                    onClick={() => this.props.onSelectAddTab()}>Add</a> a new injection if there are multiple injections
                    for the sample.
                </p>
                <Table>
                    <thead>
                    <tr>
                        <th>Location</th>
                        <th>Virus</th>
                        <th>Fluorophore</th>
                        <th>Neurons</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows}
                    </tbody>
                </Table>
                {this.renderModalAlert()}
                {this.renderAlert()}
            </div>
        );
    }

    private renderNoInjections() {
        return (
            <span>
                There are no injections for this sample.  You can <a
                onClick={() => this.props.onSelectAddTab()}> Add </a> new injections here.
            </span>
        );
    }

    public render() {
        const haveInjections = this.props.sample.injections.length > 0;

        return (
            <div>
                <h4>Edit and Remove Injections</h4>
                {haveInjections ? this.renderInjections() : this.renderNoInjections()}
            </div>
        );
    }
}
