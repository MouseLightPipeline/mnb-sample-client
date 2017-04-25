"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_apollo_1 = require("react-apollo");
const graphql_tag_1 = require("graphql-tag");
const react_bootstrap_1 = require("react-bootstrap");
const SamplesQuery = graphql_tag_1.default `query {
    samples {
        id
        idNumber
        animalId
        tag
        comment
        sampleDate
        createdAt
        updatedAt
        injections {
          id
          brainArea {
            id
            name
          }
        }
        mouseStrain {
            name
        }
    } 
}`;
const UploadSwcQuery = graphql_tag_1.default `
  mutation uploadSwc($annotator: String, $neuronId: String, $structureId: String, $files: [UploadedFile]) {
  uploadSwc(annotator: $annotator, neuronId: $neuronId, structureId: $structureId, files: $files) {
    tracing {
      id
      annotator
      nodeCount
      filename
      tracingStructure {
        id
        name
        value
      }
      neuron {
        id
        idNumber
        idString
      }
    }
    transformSubmission
    error {
      name
      message
    }
  }
}`;
let CreateTracing = class CreateTracing extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tag: "",
            isInUpload: false
        };
    }
    /*
        private onSampleChange(sample: ISample) {
            if (sample !== this.state.sample) {
                this.setState({sample, neuron: null, structure: null}, null);
            }
        }
    
        private onNeuronChange(neuron: INeuron) {
            if (neuron !== this.state.neuron) {
                this.setState({neuron, structure: null}, null);
            }
        }
    
        private onTracingStructureChange(structure: ITracingStructure) {
            this.setState({structure}, null);
        }
    
        private onAnnotatorChange(annotator: string) {
            this.setState({annotator}, null);
        }
    
        private onLockSample() {
            this.setState({isSampleLocked: !this.state.isSampleLocked}, null);
    
            if (typeof(Storage) !== "undefined") {
                if (!this.state.isSampleLocked) {
                    localStorage.setItem("tracing.create.locked.sample", this.state.sample.id);
                } else {
                    localStorage.setItem("tracing.create.locked.sample", null);
                }
            }
        }
    
        private canUploadTracing(): boolean {
            return this.state.neuron && this.state.structure && this.state.annotator.length > 0 && this.state.files.length === 1;
        }
    
        private resetUploadState() {
            let state: ICreateTracingState = Object.assign({}, this.state);
    
            state.files = [];
    
            if (this.props.shouldClearCreateContentsAfterUpload) {
                state.annotator = "";
                state.structure = null;
                state.neuron = null;
                if (!this.state.isSampleLocked) {
                    state.sample = null;
                }
            }
            this.setState(state, null);
        }
    
        private async onUploadSwc() {
            if (this.canUploadTracing()) {
                this.setState({isInUpload: true});
                try {
                    const result: ISwcUploadMutationOutput = await this.props.uploadSwc(this.state.annotator, this.state.neuron.id, this.state.structure.id, this.state.files);
    
                    if (!result.data.uploadSwc.tracing) {
                        toast.error(uploadErrorContent(result.data.uploadSwc.error), {autoClose: false});
                    } else {
                        this.resetUploadState();
                        toast.success(uploadSuccessContent(result.data.uploadSwc), {});
                    }
                    this.setState({isInUpload: false});
                } catch (error) {
                    toast.error(uploadErrorContent(error), {autoClose: false});
                    this.setState({isInUpload: false});
                }
            }
        }
    
        public componentWillReceiveProps(props: ICreateTracingProps) {
            if (typeof(Storage) !== "undefined") {
                const lockedSampleId = localStorage.getItem("tracing.create.locked.sample");
    
                if (lockedSampleId && props.samplesQuery && props.samplesQuery.samples) {
                    let samples = props.samplesQuery.samples.filter(s => s.id === lockedSampleId);
    
                    if (samples.length > 0 && this.state.sample !== samples[0]) {
                        this.setState({sample: samples[0], isSampleLocked: true}, null);
                    }
                }
            }
        }
    */
    render() {
        const tracingStructures = this.props.tracingStructuresQuery && !this.props.tracingStructuresQuery.loading ? this.props.tracingStructuresQuery.tracingStructures : [];
        // const samples = this.props.samplesQuery && !this.props.samplesQuery.loading ? this.props.samplesQuery.samples : [];
        return (React.createElement(react_bootstrap_1.Panel, { collapsible: true, defaultExpanded: true, header: "Create", bsStyle: "info", style: { marginBottom: "0px", border: "none" } },
            React.createElement(react_bootstrap_1.Grid, { fluid: true, style: { paddingTop: "10px" } })));
    }
};
CreateTracing = __decorate([
    react_apollo_1.graphql(SamplesQuery, {
        name: "samplesQuery",
        options: { pollInterval: 5000 }
    }),
    react_apollo_1.graphql(UploadSwcQuery, {
        props: ({ ownProps, mutate }) => ({
            uploadSwc: (annotator, neuronId, structureId, files) => mutate({
                variables: { annotator, neuronId, structureId, files },
            }),
        }),
    })
], CreateTracing);
exports.CreateTracing = CreateTracing;
/*
    private renderUploadRow() {
        return (
            <Row>
                <Col md={12}>
                    {this.state.isInUpload ? <ReactSpinner/> : null}
                    <FormGroup>
                        <ControlLabel>Swc Tracing</ControlLabel>
                        <InputGroup bsSize="sm">
                            <InputGroup.Button>
                                <Button bsStyle={!this.canUploadTracing() || this.state.isInUpload ? "default" : "success"}
                                        disabled={!this.canUploadTracing() || this.state.isInUpload}
                                        active={this.state.isSampleLocked}
                                        onClick={() => this.onUploadSwc()}>
                                    Upload&nbsp;&nbsp;
                                    <Glyphicon glyph="cloud-upload"/>
                                </Button>
                            </InputGroup.Button>
                        </InputGroup>
                    </FormGroup>
                </Col>
            </Row>
        );
    }

    private renderPropertiesRow(samples: ISample[], tracingStructures: ITracingStructure[]) {
        return (
            <Row>
                <Col md={3}>
                    <FormGroup>
                        <ControlLabel>Sample</ControlLabel>
                        <InputGroup bsSize="sm">
                            <SampleSelect options={samples}
                                          selectedOption={this.state.sample}
                                          disabled={this.state.isSampleLocked || this.state.isInUpload}
                                          placeholder="Select sample..."
                                          onSelect={s => this.onSampleChange(s)}/>
                            <InputGroup.Button>
                                <Button bsStyle={this.state.isSampleLocked ? "danger" : "default"}
                                        disabled={this.state.sample === null || this.state.isInUpload}
                                        active={this.state.isSampleLocked}
                                        onClick={() => this.onLockSample()}>
                                    <Glyphicon glyph="lock"/>
                                </Button>
                            </InputGroup.Button>
                        </InputGroup>
                    </FormGroup>
                </Col>
                <Col md={4}>
                    <ControlLabel>Neuron</ControlLabel>
                    <NeuronForSampleSelect sample={this.state.sample}
                                           selectedNeuron={this.state.neuron}
                                           onNeuronChange={n => this.onNeuronChange(n)}
                                           disabled={this.state.sample === null || this.state.isInUpload}
                                           placeholder={this.state.sample ? "Select a neuron..." : "Select a sample to select a neuron..."}/>
                </Col>
                <Col md={2}>
                    <ControlLabel>Structure</ControlLabel>
                    <TracingStructureSelect options={tracingStructures}
                                            selectedOption={this.state.structure}
                                            disabled={this.state.isInUpload}
                                            placeholder="Select structure..."
                                            onSelect={t => this.onTracingStructureChange(t)}/>
                </Col>
                <Col md={3}>
                    <FormGroup controlId="annotatorText"
                               validationState={this.state.annotator.length > 0 ? "success" : "error"}>
                        <ControlLabel>Annotator</ControlLabel>
                        <FormControl type="test" bsSize="sm"
                                     value={this.state.annotator}
                                     disabled={this.state.isInUpload}
                                     placeholder="(required)"
                                     onChange={(e: any) => this.onAnnotatorChange(e.target.value)}/>
                    </FormGroup>
                </Col>
            </Row>
        );
    }
}
/*
const uploadSuccessContent = (output: ISwcUploadOutput) => {
    return (
        <div>
            <h3>Upload successful</h3>
            {`${output.tracing.filename} by ${output.tracing.annotator}`}
            <br/>
            {`${output.tracing.nodeCount} nodes loaded from file`}
            <br/>
            <Label bsStyle={output.transformSubmission ? "success" : "danger"}>
                Registration
            </Label>
            &nbsp;
            {output.transformSubmission ? "Submission to registration transform service successful" : "Submission to registration transform service failed"}
        </div>
    );
};

const uploadErrorContent = (error: Error) => {
    return (<div><h3>Upload failed</h3>{error ? error.message : "(no additional details available)"}</div>);
};
*/ 
//# sourceMappingURL=CreateSample.js.map