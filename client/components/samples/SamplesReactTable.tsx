import * as React from "react";
import {toast} from "react-toastify";
import {Button, Segment, Confirm, Header, Dropdown, List, Label} from "semantic-ui-react";
import * as ReactDatePickerMod from "react-datepicker";

const ReactDatePicker = ReactDatePickerMod.default;

import {ManageTransforms} from "../transforms/ManageTransforms";
import {ManageInjections} from "../injections/ManageInjections";
import {toastCreateError, toastDeleteError, toastUpdateError} from "../elements/Toasts";
import {displaySample, ISample} from "../../models/sample";
import {IMouseStrain} from "../../models/mouseStrain";
import {PaginationHeader} from "../elements/PaginationHeader";
import {UserPreferences} from "../../util/userPreferences";
import {
    CREATE_SAMPLE_MUTATION,
    CreateSampleMutation,
    CreateSampleMutationData, DELETE_SAMPLE_MUTATION,
    DeleteSampleMutation, UPDATE_SAMPLE_MUTATION, UpdateSampleMutation, UpdateSampleMutationData, UpdateSampleMutationFn
} from "../../graphql/sample";
import ReactTable from "react-table";
import {FindVisibilityOption, SampleVisibilityOptions, ShareVisibility} from "../../models/shareVisibility";
import moment = require("moment");
import {InputPopup} from "../editors/InputPopup";
import {TextAreaPopup} from "../editors/TextAreaPopup";
import {displayInjection, IInjection} from "../../models/injection";
import {displayRegistrationTransform} from "../../models/registrationTransform";
import {AutoSuggestPopup} from "../editors/AutoSuggestPopup";

interface ISamplesProps {
    samples: ISample[];
    mouseStrains: IMouseStrain[];
}

interface ISamplesState {
    offset?: number;
    limit?: number;
    requestedSampleForDelete?: ISample;
    isTransformDialogShown?: boolean;
    manageTransformsSample?: ISample;
    isInjectionDialogShown?: boolean;
    manageInjectionsSample?: ISample;
}

export class SamplesReactTable extends React.Component<ISamplesProps, ISamplesState> {
    public constructor(props: ISamplesProps) {
        super(props);

        this.state = {
            offset: UserPreferences.Instance.samplePageOffset,
            limit: UserPreferences.Instance.samplePageLimit,
            requestedSampleForDelete: null,
            isTransformDialogShown: false,
            manageTransformsSample: null,
            isInjectionDialogShown: false,
            manageInjectionsSample: null
        }
    }

    public componentWillReceiveProps(props: ISamplesProps) {
        if (this.state.manageTransformsSample) {
            const s = props.samples.find(s => s.id === this.state.manageTransformsSample.id);
            if (s) {
                this.setState({manageTransformsSample: s});
            }
        }

        if (this.state.manageInjectionsSample) {
            const s = props.samples.find(s => s.id === this.state.manageInjectionsSample.id);
            if (s) {
                this.setState({manageInjectionsSample: s});
            }
        }
    }

    private onUpdateOffsetForPage(page: number) {
        const offset = this.state.limit * (page - 1);

        if (offset !== this.state.offset) {
            this.setState({offset});

            UserPreferences.Instance.samplePageOffset = offset;
        }
    }

    private onUpdateLimit(limit: number) {
        if (limit !== this.state.limit) {
            let offset = this.state.offset;

            if (offset < limit) {
                offset = 0;
            }

            this.setState({offset, limit});

            UserPreferences.Instance.samplePageOffset = offset;
            UserPreferences.Instance.samplePageLimit = limit;
        }
    }

    private onRequestAddRegistrationTransform(forSample: ISample) {
        this.setState({
            isTransformDialogShown: true,
            manageTransformsSample: forSample,
        });
    }

    private onRequestManageInjections(forSample: ISample) {
        this.setState({
            isInjectionDialogShown: true,
            manageInjectionsSample: forSample
        });
    }

    private renderTransformsDialog() {
        if (this.state.manageTransformsSample && this.state.isTransformDialogShown) {
            return (
                <ManageTransforms sample={this.state.manageTransformsSample}
                                  show={this.state.isTransformDialogShown}
                                  onClose={() => this.setState({isTransformDialogShown: false})}/>
            );
        } else {
            return null;
        }
    }

    private renderInjectionsDialog() {
        if (this.state.manageInjectionsSample && this.state.isInjectionDialogShown) {
            return (
                <ManageInjections sample={this.state.manageInjectionsSample}
                                  show={this.state.isInjectionDialogShown}
                                  onClose={() => this.setState({isInjectionDialogShown: false})}/>
            );
        } else {
            return null;
        }
    }

    private renderDeleteConfirmationModal() {
        if (!this.state.requestedSampleForDelete) {
            return null;
        }

        return <DeleteSampleMutation mutation={DELETE_SAMPLE_MUTATION} refetchQueries={["AppQuery"]}
                                     onError={(error) => toast.error(toastDeleteError(error), {autoClose: false})}>
            {(deleteSample) => (
                <Confirm open={true} dimmer="blurring"
                         header="Delete Sample?"
                         content={`Are you sure you want to delete the sample ${displaySample(this.state.requestedSampleForDelete)}?`}
                         confirmButton="Delete"
                         onCancel={() => this.setState({requestedSampleForDelete: null})}
                         onConfirm={() => {
                             deleteSample({variables: {id: this.state.requestedSampleForDelete.id}});
                             this.setState({requestedSampleForDelete: null});
                         }}/>)}
        </DeleteSampleMutation>;
    }

    private renderInjections(injections: IInjection[], isExpanded: boolean) {
        if (!injections || injections.length === 0) {
            return "(none)";
        }

        if (injections.length === 1) {
            return displayInjection(injections[0], 28);
        }

        if (!isExpanded) {
            return `${injections.length} injections`;
        }

        const rows = injections.map(i => (
            <List.Item key={`sil_${i.id}`}>
                {displayInjection(i, 28)}
            </List.Item>)
        );

        return <List>{rows} </List>;
    }

    public render() {
        const samples = this.props.samples.sort((a, b) => b.createdAt - a.createdAt).slice(this.state.offset, this.state.offset + this.state.limit);

        const totalCount = this.props.samples.length;

        const pageCount = Math.ceil(totalCount / this.state.limit);

        const activePage = (this.state.offset ? (Math.floor(this.state.offset / this.state.limit) + 1) : 1);

        const start = this.state.offset + 1;
        const end = Math.min(this.state.offset + this.state.limit, totalCount);

        return (
            <UpdateSampleMutation mutation={UPDATE_SAMPLE_MUTATION}
                                  onCompleted={(data) => onSampleUpdated(data.updateSample)}
                                  onError={(error) => toast.error(toastUpdateError(error), {autoClose: false})}>
                {(updateSample) => {
                    const columns = [{
                        Header: "Id",
                        accessor: "idNumber",
                        maxWidth: 40,
                        Cell: (row: any) => (
                            <InputPopup value={row.value} header={`Sample ${row.original.idNumber} Id`}
                                        placeholder="Enter new id..." isValidValueFcn={(val) => !isNaN(parseInt(val))}
                                        onAccept={(value) => this.onAcceptIdNumberEdit(row.original, value, updateSample)}/>
                        )
                    }, {
                        Header: "Acq. Date",
                        accessor: "sampleDate",
                        maxWidth: 100,
                        Cell: (row: any) => (
                            <ReactDatePicker
                                className="date-picker-input"
                                dateFormat="YYYY-MM-DD"
                                selected={moment(new Date(row.value))}
                                onChange={(d) => this.onDateChanged(row.original, d.toDate(), updateSample)}
                            />
                        )
                    }, {
                        Header: "Tag",
                        accessor: "tag",
                        Cell: (row: any) => (
                            <TextAreaPopup value={row.value} header={`Sample ${row.original.idNumber} Tag`}
                                           placeholder="Enter new tag..."
                                           onAccept={(value) => this.onAcceptTagEdit(row.original, value, updateSample)}/>
                        )
                    }, {
                        Header: "Animal",
                        accessor: "animalId",
                        width: 80,
                        Cell: (row: any) => (
                            <InputPopup value={row.value} header={`Sample ${row.original.idNumber} Animal Id`}
                                        placeholder="Enter animal id..."
                                        onAccept={(value) => this.onAcceptAnimalIdEdit(row.original, value, updateSample)}/>
                        ),
                    }, {
                        Header: "Strain",
                        accessor: "mouseStrain",
                        width: 120,
                        Cell: (row: any) => (
                            <AutoSuggestPopup<IMouseStrain> items={this.props.mouseStrains}
                                                            header={`Sample ${row.original.idNumber} Mouse Strain`}
                                                            placeholder="select or name a mouse strain"
                                                            value={row.value ? row.value.name : ""}
                                                            onChange={(v: string) => this.onAcceptMouseStrainChange(row.original, v, updateSample)}/>
                        ),
                    }, {
                        Header: "Registrations",
                        accessor: "activeRegistrationTransform",
                        maxWidth: 200,
                        Cell: (row: any) => (
                            <a onClick={() => this.onRequestAddRegistrationTransform(row.original)}>
                                {row.value ? displayRegistrationTransform(row.value) : "(none)"}
                            </a>
                        )
                    }, {
                        Header: "Injections",
                        accessor: "injections",
                        maxWidth: 220,
                        Cell: (row: any) => (
                            <a onClick={() => this.onRequestManageInjections(row.original)}>
                                {this.renderInjections(row.value, row.isExpanded !== undefined && row.isExpanded !== false)}
                            </a>
                        )
                    }, {
                        Header: "Visibility",
                        accessor: "sharing",
                        maxWidth: 110,
                        Cell: (row: any) => (
                            <Dropdown search fluid inline options={SampleVisibilityOptions}
                                      value={FindVisibilityOption(row.value).value}
                                      onChange={(e, {value}) => this.onAcceptVisibility(row.original, value as ShareVisibility, updateSample)}/>
                        )
                    }, {
                        Header: "",
                        accessor: "neuronCount",
                        maxWidth: 120,
                        Cell: (row: any) => {
                            return row.value === 0 ?
                                <Button icon="trash" color="red" size="mini" content="delete" labelPosition="left"
                                        onClick={() => this.setState({requestedSampleForDelete: row.original})}/> :
                                <Label>{row.value}<Label.Detail>neurons</Label.Detail></Label>

                        }
                    }];

                    const subComponent = (row: any) => {
                        return (
                            <div/>
                        );
                    };

                    return (
                        <div>
                            {this.renderTransformsDialog()}
                            {this.renderInjectionsDialog()}
                            {this.renderDeleteConfirmationModal()}
                            <Segment.Group>
                                <Segment secondary
                                         style={{
                                             display: "flex",
                                             alignItems: "center",
                                             justifyContent: "space-between"
                                         }}>
                                    <Header content="Samples" style={{margin: "0"}}/>
                                    <CreateSampleMutation mutation={CREATE_SAMPLE_MUTATION}
                                                          refetchQueries={["AppQuery"]}
                                                          onCompleted={(data) => onSampleCreated(data.createSample)}
                                                          onError={(error) => toast.error(toastCreateError(error), {autoClose: false})}>
                                        {(createSample) => (
                                            <Button content="Add" icon="add" size="tiny" labelPosition="right"
                                                    color="blue"
                                                    floated="right"
                                                    onClick={() => createSample({variables: {sample: {}}})}/>
                                        )}
                                    </CreateSampleMutation>
                                </Segment>
                                <Segment>
                                    <PaginationHeader pageCount={pageCount}
                                                      activePage={activePage}
                                                      limit={this.state.limit}
                                                      onUpdateLimitForPage={limit => this.onUpdateLimit(limit)}
                                                      onUpdateOffsetForPage={page => this.onUpdateOffsetForPage(page)}/>
                                </Segment>
                                <Segment as="div" style={{padding: 0}}>
                                    <ReactTable showPagination={false} pageSize={Math.min(totalCount, this.state.limit)}
                                                data={samples}
                                                columns={columns}
                                                collapseOnDataChange={false}
                                                SubComponent={subComponent}
                                                sortable={false}
                                                resizable={true}
                                                getTdProps={(state: any, rowInfo: any, column: any) => {
                                                    if (column.Header === "Visibility")
                                                        return {className: "-menu"};
                                                    return {};
                                                }}
                                    />
                                </Segment>
                                <Segment secondary style={{display: "flex", justifyContent: "space-between"}}>
                                    <div style={{order: 0}}>
                                        {totalCount >= 0 ? (totalCount > 0 ? `Showing ${start} to ${end} of ${totalCount} samples` : "It's a clean slate - create the first sample!") : ""}
                                    </div>
                                    <div style={{order: 1}}>
                                        <i>Click a value to edit. Expand to view additional properties.</i>
                                    </div>
                                    <div style={{order: 2}}>
                                        {`Page ${activePage} of ${pageCount}`}
                                    </div>
                                </Segment>
                            </Segment.Group>
                        </div>
                    );
                }}
            </UpdateSampleMutation>
        );
    }

    private async onAcceptIdNumberEdit(sample: ISample, value: string, updateFn: UpdateSampleMutationFn) {
        const idNumber = parseInt(value);

        if (!isNaN(idNumber) && idNumber !== sample.idNumber) {
            await updateFn({variables: {sample: {id: sample.id, idNumber}}});
        }
    }

    private async onDateChanged(sample: ISample, value: Date, updateFn: UpdateSampleMutationFn) {
        if (value.valueOf() !== sample.sampleDate) {
            await updateFn({variables: {sample: {id: sample.id, sampleDate: value.valueOf()}}});
        }
    }

    private async onAcceptTagEdit(sample: ISample, value: string, updateFn: UpdateSampleMutationFn) {
        if (value !== sample.tag) {
            await updateFn({variables: {sample: {id: sample.id, tag: value}}});
        }
    }

    private async onAcceptAnimalIdEdit(sample: ISample, value: string, updateFn: UpdateSampleMutationFn) {
        if (value !== sample.animalId) {
            await updateFn({variables: {sample: {id: sample.id, animalId: value}}});
        }
    }

    private async onAcceptVisibility(sample: ISample, visibility: ShareVisibility, updateFn: UpdateSampleMutationFn) {
        if (visibility !== sample.sharing) {
            await updateFn({variables: {sample: {id: sample.id, sharing: visibility}}});
        }
    }

    private async onAcceptMouseStrainChange(sample: ISample, name: string, updateFn: UpdateSampleMutationFn) {
        if ((!sample.mouseStrain || name !== sample.mouseStrain.name) || (!name && sample.mouseStrain)) {
            await updateFn({variables: {sample: {id: sample.id, mouseStrainName: name || null}}});
        }
    }
}

function onSampleCreated(data: CreateSampleMutationData) {
    if (!data.source || data.error) {
        toast.error(toastCreateError(data.error), {autoClose: false});
    }
}

function onSampleUpdated(data: UpdateSampleMutationData) {
    if (!data.source || data.error) {
        toast.error(toastCreateError(data.error), {autoClose: false});
    }
}
