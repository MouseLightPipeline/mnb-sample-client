/*
    Uses local storage where available for cross-session persistence.  Otherwise stores in memory for per session
    persistence.
 */
export class UserPreferences {
    private _neuronCreateLockedSampleId: string = null;

    public get neuronCreateLockedSampleId() {
        if (typeof(Storage) !== undefined) {
            return localStorage.getItem("neuron.create.locked.sample");
        } else {
            return this._neuronCreateLockedSampleId;
        }
    }

    public set neuronCreateLockedSampleId(id: string) {
        if (typeof(Storage) !== undefined) {
            localStorage.setItem("neuron.create.locked.sample", id);
        } else {
            this._neuronCreateLockedSampleId = id;
        }
    }
}

export const UserPreferencesManager: UserPreferences = new UserPreferences();
