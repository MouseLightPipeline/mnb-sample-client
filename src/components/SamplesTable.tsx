import * as React from "react";
import {Panel, Table} from "react-bootstrap";
import {graphql, InjectedGraphQLProps} from 'react-apollo';
import gql from "graphql-tag";
import * as update from "immutability-helper";

import {PaginationHeader} from "./util/PaginationHeader";
import {IQueryOuput} from "../util/graphQLTypes";
import {ISample} from "../models/sample";
import {SampleRow} from "./SampleRow";
import {IMouseStrain} from "../models/mouseStrain";
import {CreateMouseStrainDialog, ICreateMouseStrainDelegate} from "./dialogs/CreateMouseStrain";
import {
    ManageRegistrationTransforms,
    ICreateRegistrationTransformDelegate
} from "./dialogs/ManageRegistrationTransforms";
import {IRegistrationTransformInput} from "../models/registrationTransform";

const samplesQuery = gql`query sampleTableQuery($input: SampleQueryInput) {
  samples(input: $input) {
    totalCount
    items {
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
        createdAt
        updatedAt
    }
  }
}`;

const CreateMouseStrainMutation = gql`mutation createMouseStrain($mouseStrain: MouseStrainInput) {
  createMouseStrain(mouseStrain: $mouseStrain) {
    mouseStrain {
        id
        name
        updatedAt
        createdAt
    }
    error {
      message
    }
  }
}`;

const CreateRegistrationTransformMutation = gql`mutation createRegistrationTransform($registrationTransform: RegistrationTransformInput) {
  createRegistrationTransform(registrationTransform: $registrationTransform) {
    registrationTransform {
        id
        name
        location
        notes
        updatedAt
        createdAt
    }
    error {
      message
    }
  }
}`;

interface ISamplesGraphQLProps {
    samples: IQueryOuput<ISample>;
}

interface ISamplesProps extends InjectedGraphQLProps<ISamplesGraphQLProps> {
    mouseStrains: IMouseStrain[];

    offset: number;
    limit: number;

    onUpdateOffsetForPage(page: number): void;
    onUpdateLimit(limit: number): void;

    createMouseStrain?(mouseStrain: IMouseStrain): any;
    createRegistrationTransform?(registrationTransform: IRegistrationTransformInput): any;
}

interface ISamplesState {
    isCreateMouseDialogShown?: boolean;
    createMouseStrainDelegate?: ICreateMouseStrainDelegate;
    isCreateRegistrationTransformDialogShown?: boolean;
    manageRegistrationsSample?: ISample;
    createRegistrationTransformDelegate?: ICreateRegistrationTransformDelegate;
}

@graphql(samplesQuery, {
    options: ({offset, limit}) => ({
        pollInterval: 5000,
        variables: {
            input: {
                offset: offset,
                limit: limit
            }
        }
    })
})
@graphql(CreateMouseStrainMutation, {
    props: ({mutate}) => ({
        createMouseStrain: (mouseStrain: IMouseStrain) => mutate({
            variables: {mouseStrain},
            updateQueries: {
                MouseStrains: (prev: IMouseStrain[], {mutationResult}: any) => {
                    const response = mutationResult.data.createMouseStrain;

                    return update(prev, {
                        mouseStrains: {$push: [response.mouseStrain]}
                    });
                }
            }
        })
    })
})
@graphql(CreateRegistrationTransformMutation, {
    props: ({mutate}) => ({
        createRegistrationTransform: (registrationTransform: IRegistrationTransformInput) => mutate({
            variables: {registrationTransform}, /*
             updateQueries: {
             MouseStrains: (prev: IMouseStrain[], {mutationResult}: any) => {
             const response = mutationResult.data.createMouseStrain;

             return update(prev, {
             mouseStrains: {$push: [response.mouseStrain]}
             });
             }
             }*/
        })
    })
})
export class SamplesTable extends React.Component<ISamplesProps, ISamplesState> {
    public constructor(props: ISamplesProps) {
        super(props);

        this.state = {
            isCreateMouseDialogShown: false,
            createMouseStrainDelegate: null,
            isCreateRegistrationTransformDialogShown: false,
            manageRegistrationsSample: null,
            createRegistrationTransformDelegate: null
        }
    }

    private onRequestAddRegistrationTransform(forSample: ISample, delegate: ICreateRegistrationTransformDelegate) {
        this.setState({
            isCreateRegistrationTransformDialogShown: true,
            manageRegistrationsSample: forSample,
            createRegistrationTransformDelegate: delegate
        });
    }

    private async onRegistrationTransformCreated(registrationTransform: IRegistrationTransformInput) {
        try {
            console.log(registrationTransform);
            const result = await this.props.createRegistrationTransform(registrationTransform);

            if (!result.data.createRegistrationTransform.registrationTransform) {
                // toast.error(updateErrorContent(result.data.updateSample.error), {autoClose: false});
            } else {
                if (this.state.createRegistrationTransformDelegate) {
                    this.state.createRegistrationTransformDelegate(result.data.createRegistrationTransform.registrationTransform);
                }
                // toast.success(updateSuccessContent(), {autoClose: 3000});
            }
        } catch (error) {
            // toast.error(updateErrorContent(error), {autoClose: false});
        }

        this.setState({isCreateRegistrationTransformDialogShown: false});
    }

    private onRequestAddMouseStrain(delegate: ICreateMouseStrainDelegate) {
        this.setState({isCreateMouseDialogShown: true, createMouseStrainDelegate: delegate});
    }

    private async onMouseStrainCreated(mouseStrain: IMouseStrain) {
        try {
            const result = await this.props.createMouseStrain(mouseStrain);

            if (!result.data.createMouseStrain.mouseStrain) {
                // toast.error(updateErrorContent(result.data.updateSample.error), {autoClose: false});
            } else {
                if (this.state.createMouseStrainDelegate) {
                    this.state.createMouseStrainDelegate(result.data.createMouseStrain.mouseStrain);
                }
                // toast.success(updateSuccessContent(), {autoClose: 3000});
            }
        } catch (error) {
            // toast.error(updateErrorContent(error), {autoClose: false});
        }

        this.setState({isCreateMouseDialogShown: false});
    }

    private renderPanelFooter(totalCount: number, activePage: number, pageCount: number) {
        return (
            <div>
                <span>
                    {totalCount >= 0 ? (totalCount > 0 ? `${totalCount} samples` : "It's a clean slate - create the first sample!") : ""}
                </span>
                <span className="pull-right">
                    {`Page ${activePage} of ${pageCount}`}
                </span>
            </div>
        );
    }

    public render() {
        const isDataAvailable = this.props.data && !this.props.data.loading;

        const samples = isDataAvailable ? this.props.data.samples.items : [];

        const rows = samples.map(s => {
            return <SampleRow key={`sl_${s.id}`} sample={s} mouseStrains={this.props.mouseStrains}
                              onRequestAddRegistrationTransform={(s, d) => this.onRequestAddRegistrationTransform(s, d)}
                              onRequestAddMouseStrain={(d) => this.onRequestAddMouseStrain(d)}/>
        });

        const totalCount = isDataAvailable ? this.props.data.samples.totalCount : -1;

        const pageCount = isDataAvailable ? Math.ceil(totalCount / this.props.limit) : 1;

        const activePage = isDataAvailable ? (this.props.offset ? (Math.floor(this.props.offset / this.props.limit) + 1) : 1) : 0;

        return (
            <Panel collapsible defaultExpanded header="Samples" bsStyle="info"
                   footer={this.renderPanelFooter(totalCount, activePage, pageCount)}
                   style={{border: "none", borderBottom: "1px solid #ddd", marginBottom: "0px"}}>
                <PaginationHeader pageCount={pageCount}
                                  activePage={activePage}
                                  limit={this.props.limit}
                                  onUpdateLimitForPage={limit => this.props.onUpdateLimit(limit)}
                                  onUpdateOffsetForPage={page => this.props.onUpdateOffsetForPage(page)}/>
                <Table style={{marginBottom: "0px"}}>
                    <thead>
                    <tr>
                        <th>Id</th>
                        <th>Tag</th>
                        <th>Animal Id</th>
                        <th>Acq. Date</th>
                        <th>Strain</th>
                        <th>Registration</th>
                        <th>Injections</th>
                        <th>Comment</th>
                        <th>Created</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows}
                    </tbody>
                </Table>
                <CreateMouseStrainDialog show={this.state.isCreateMouseDialogShown}
                                         onCancel={() => this.setState({isCreateMouseDialogShown: false})}
                                         onCreate={(m) => this.onMouseStrainCreated(m)}/>
                <ManageRegistrationTransforms sample={this.state.manageRegistrationsSample}
                                              show={this.state.isCreateRegistrationTransformDialogShown}
                                              onCancel={() => this.setState({isCreateRegistrationTransformDialogShown: false})}
                                              onCreate={(m) => this.onRegistrationTransformCreated(m)}/>
            </Panel>
        );
    }
}
