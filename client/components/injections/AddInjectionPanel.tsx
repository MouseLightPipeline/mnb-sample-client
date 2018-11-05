import * as React from "react";
import {Button, Form, Header} from "semantic-ui-react";
import {toast} from "react-toastify";

import {ISample} from "../../models/sample";
import {IInjectionVirus} from "../../models/injectionVirus";
import {VirusAutoSuggest} from "../editors/VirusAutoSuggest";
import {IFluorophore} from "../../models/fluorophore";
import {lookupBrainArea} from "../App";
import {IBrainArea} from "../../models/brainArea";
import {FluorophoreAutoSuggest} from "../editors/FluorophoreAutoSuggest";
import {toastCreateError, toastCreateSuccess} from "../elements/Toasts";
import update from "immutability-helper";
import {BrainAreaDropdown} from "../editors/BrainAreaDropdown";
import {
    CREATE_INJECTION_MUTATION,
    CreateInjectionMutation,
    CreateInjectionMutationData,
    InjectionVariables
} from "../../graphql/injection";
import {isNullOrUndefined} from "../../util/nodeUtil";

interface IAddInjectionProps {
    sample: ISample;
    injectionViruses: IInjectionVirus[];
    fluorophores: IFluorophore[];

    refetch(): any;
}

interface IAddInjectionState {
    injection?: InjectionVariables;
}

export class AddInjectionPanel extends React.Component<IAddInjectionProps, IAddInjectionState> {
    public constructor(props: IAddInjectionProps) {
        super(props);

        this.state = {
            injection: {
                id: null,
                injectionVirusId: null,
                injectionVirusName: null,
                fluorophoreId: null,
                fluorophoreName: null,
                brainAreaId: null,
                sampleId: props.sample.id
            }
        }
    }

    private get isValidBrainAreaId(): boolean {
        return !isNullOrUndefined(this.state.injection.brainAreaId);
    }

    private get isValidCreateState(): boolean {
        return !isNullOrUndefined(this.state.injection.injectionVirusName)
            && !isNullOrUndefined(this.state.injection.fluorophoreName)
            && this.isValidBrainAreaId
    }

    private onVirusChange(value: string) {
        this.setState(update(this.state, {injection: {injectionVirusName: {$set: value.length === 0 ? null : value}}}));
    }

    private onFluorophoreChange(value: string) {
        this.setState(update(this.state, {injection: {fluorophoreName: {$set: value.length === 0 ? null : value}}}));
    }

    private onBrainAreaChange(brainArea: IBrainArea) {
        this.setState(update(this.state, {injection: {brainAreaId: {$set: brainArea ? brainArea.id : null}}}));
    }

    public componentWillReceiveProps(props: IAddInjectionProps) {
        this.setState(update(this.state, {injection: {sampleId: {$set: props.sample.id}}}));
    }

    public onInjectionCreated(data: CreateInjectionMutationData) {
        if (!data.injection || data.error) {
            toast.error(toastCreateError(data.error.message), {autoClose: false});
        } else {
            this.props.refetch();
            toast.success(toastCreateSuccess());
        }
    }

    public render() {
        return (
            <div>
                <Header content="Add Injections"
                        subheader="Injections are defined per sample. They are the link between samples and the set of neurons and their associated tracings."/>
                <Form>
                    <Form.Field>
                        <label>Brain Area</label>
                        <BrainAreaDropdown isEditOnly={true}
                                           brainArea={lookupBrainArea(this.state.injection.brainAreaId)}
                                           onBrainAreaChange={(brainArea: IBrainArea) => this.onBrainAreaChange(brainArea)}/>
                    </Form.Field>
                    <Form.Field>
                        <label>Virus</label>
                        <VirusAutoSuggest items={this.props.injectionViruses} displayProperty="name"
                                          placeholder="select or name a new virus"
                                          initialValue={this.state.injection.injectionVirusName}
                                          isDeferredEditMode={false}
                                          isEditOnly={true}
                                          onChange={(v: string) => this.onVirusChange(v)}/>
                    </Form.Field>
                    <Form.Field>
                        <label>Fluorophore</label>
                        <FluorophoreAutoSuggest items={this.props.fluorophores} displayProperty="name"
                                                placeholder="select or name a new fluorophore"
                                                initialValue={this.state.injection.fluorophoreName}
                                                isDeferredEditMode={false}
                                                isEditOnly={true}
                                                onChange={(v: string) => this.onFluorophoreChange(v)}/>
                    </Form.Field>
                    <CreateInjectionMutation mutation={CREATE_INJECTION_MUTATION} refetchQueries={["AppQuery"]}
                                             onCompleted={(data) => this.onInjectionCreated(data.createInjection)}
                                             onError={(error) => toast.error(toastCreateError(error), {autoClose: false})}>
                        {(createInjection) => (
                            <Button color="teal" content="Add" disabled={!this.isValidCreateState}
                                    onClick={() => createInjection({variables: {injectionInput: this.state.injection}})}/>
                        )}
                    </CreateInjectionMutation>
                </Form>
            </div>
        );
    }
}
