import {PreferencesManager} from "./preferencesManager";

const SamplePageOffset = "sample.page.offset";
const SamplePageLimit = "sample.page.limit";
const NeuronPageOffset = "neuron.page.offset";
const NeuronPageLimit = "neuron.page.limit";
const LockedSampleId = "neuron.create.locked.sample";

export class UserPreferences extends PreferencesManager {
    private static _instance: UserPreferences = null;

    public static get Instance(): UserPreferences {
        if (!this._instance) {
            this._instance = new UserPreferences("mnb:");
        }

        return this._instance;
    }

    public get samplePageOffset(): number {
        return this.loadLocalValue(SamplePageOffset, 0);
    }

    public set samplePageOffset(offset: number) {
        this.saveLocalValue(SamplePageOffset, offset);
    }

    public get samplePageLimit(): number {
        return this.loadLocalValue(SamplePageLimit, 10);
    }

    public set samplePageLimit(offset: number) {
        this.saveLocalValue(SamplePageLimit, offset);
    }

    public get neuronPageOffset(): number {
        return this.loadLocalValue(NeuronPageOffset, 0);
    }

    public set neuronPageOffset(offset: number) {
        this.saveLocalValue(NeuronPageOffset, offset);
    }

    public get neuronPageLimit(): number {
        return this.loadLocalValue(NeuronPageLimit, 10);
    }

    public set neuronPageLimit(offset: number) {
        this.saveLocalValue(NeuronPageLimit, offset);
    }

    public get neuronCreateLockedSampleId(): string {
        return this.loadLocalValue(LockedSampleId, "");
    }

    public set neuronCreateLockedSampleId(id: string) {
        this.saveLocalValue(LockedSampleId, id);
    }

    protected validateDefaultPreferences() {
        this.setDefaultLocalValue(SamplePageOffset, 0);
        this.setDefaultLocalValue(SamplePageLimit, 10);
        this.setDefaultLocalValue(NeuronPageOffset, 0);
        this.setDefaultLocalValue(NeuronPageLimit, 10);
        this.setDefaultLocalValue(LockedSampleId, "");
    }
}

