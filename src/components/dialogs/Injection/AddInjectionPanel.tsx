import * as React from "react";
import {Button, FormGroup, ControlLabel, HelpBlock} from "react-bootstrap";
import {graphql} from 'react-apollo';
import {toast} from "react-toastify";
import * as update from "immutability-helper";

import {ISample} from "../../../models/sample";
import {IInjection, IInjectionInput} from "../../../models/injection";
import {CreateInjectionMutation} from "../../../graphql/injection";
import {IInjectionVirus} from "../../../models/injectionVirus";
import {isNullOrUndefined} from "util";
import {VirusAutoSuggest} from "../../editors/VirusAutoSuggest";
import {IFluorophore} from "../../../models/fluorophore";
import {BrainAreaSelect} from "../../editors/BrainAreaSelect";
import {BrainAreas, lookupBrainArea} from "../../App";
import {IBrainArea} from "../../../models/brainArea";
import {FluorophoreAutoSuggest} from "../../editors/FluorophoreAutoSuggest";
import {toastUpdateError, toastUpdateSuccess} from "../../util/Toasts";

type ValidationState = "success" | "warning" | "error";

interface IAddInjectionProps {
    sample: ISample;

    injectionViruses: IInjectionVirus[];
    fluorophores: IFluorophore[];

    onCreated?(injection: IInjection): void;
    onSelectManageTab?(): void;
    onCloseAfterCreate?(): void;

    createInjection?(injectionInput: IInjectionInput): any;
}

interface IAddInjectionState {
    injection?: IInjectionInput;
}

@graphql(CreateInjectionMutation, {
    props: ({mutate}) => ({
        createInjection: (injectionInput: IInjectionInput) => mutate({
            variables: {injectionInput}
        })
    })
})
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

    private async onCreateInjection() {
        try {
            const result = await this.props.createInjection(this.state.injection);

            if (!result.data.createInjection.injection) {
                toast.error(toastUpdateError(result.data.createInjection.error), {autoClose: false});
            } else {
                toast.success(toastUpdateSuccess(), {autoClose: 3000});

                if (this.props.onCloseAfterCreate) {
                    this.props.onCloseAfterCreate();
                }
            }
        } catch (error) {
            toast.error(toastUpdateError(error), {autoClose: false});
        }


        this.props.createInjection(this.state.injection);
    }

    private get brainAreaValidationState(): ValidationState {
        return this.isDuplicateBrainAreaId ? "error" : null;
    }

    private get isDuplicateBrainAreaId(): boolean {
        return this.props.sample.injections.map(o => o.brainArea.id).indexOf(this.state.injection.brainAreaId) > -1
    }

    private get isValidBrainAreaId(): boolean {
        return !isNullOrUndefined(this.state.injection.brainAreaId) && !this.isDuplicateBrainAreaId;
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

    private renderVirusAutoSuggest() {
        return (<VirusAutoSuggest items={this.props.injectionViruses} displayProperty="name"
                                  placeholder="select or name a new virus"
                                  initialValue={this.state.injection.injectionVirusName}
                                  isDeferredEditMode={false}
                                  isEditOnly={true}
                                  onChange={(v: string) => this.onVirusChange(v)}/>);
    }

    private renderFluorophoreAutoSuggest() {
        return (<FluorophoreAutoSuggest items={this.props.fluorophores} displayProperty="name"
                                        placeholder="select or name a new fluorophore"
                                        initialValue={this.state.injection.fluorophoreName}
                                        isDeferredEditMode={false}
                                        isEditOnly={true}
                                        onChange={(v: string) => this.onFluorophoreChange(v)}/>);
    }

    private renderHelpBlock() {
        if (this.isDuplicateBrainAreaId) {
            return "An injection already exists for this compartment"
        }

        return null;
    }

    public render() {
        return (
            <div>
                <h4>Add Injections</h4>
                <p>
                    Injections are defined per sample. They are the link between samples and the set of neurons and
                    their associated tracings.
                </p>
                <p>
                    There can only be one injection per brain area (per sample).
                </p>
                <FormGroup bsSize="sm" controlId="brain-area-group" validationState={this.brainAreaValidationState}>
                    <ControlLabel>Brain Area</ControlLabel>
                    <BrainAreaSelect idName="brain-area"
                                     options={BrainAreas}
                                     selectedOption={lookupBrainArea(this.state.injection.brainAreaId)}
                                     multiSelect={false}
                                     placeholder="select..."
                                     onSelect={(brainArea: IBrainArea) => this.onBrainAreaChange(brainArea)}/>
                    <HelpBlock>{this.renderHelpBlock()}</HelpBlock>
                </FormGroup>
                <FormGroup bsSize="sm">
                    <ControlLabel>Virus</ControlLabel>
                    {this.renderVirusAutoSuggest()}
                </FormGroup>
                <FormGroup bsSize="sm">
                    <ControlLabel>Fluorophore</ControlLabel>
                    {this.renderFluorophoreAutoSuggest()}
                </FormGroup>
                <Button bsStyle="success" disabled={!this.isValidCreateState}
                        onClick={() => this.onCreateInjection()}>Add</Button>
            </div>
        );
    }
}
