import * as React from "react";
import {useState} from "react";
import Dropzone = require("react-dropzone");
import {toast} from "react-toastify";
import {ApolloError} from "apollo-client";
import {Button, Divider, Grid, Modal, Segment} from "semantic-ui-react";
import {TextAlignProperty} from "csstype";
import {displayNeuron, INeuron, IParsedAnnotationMetadata, parseAnnotationMetadata, parseNeuronAnnotationMetadata} from "../../models/neuron";
import {
    UPLOAD_NEURON_ANNOTATION_METADATA_MUTATION, UploadAnnotationMetadataMutationData,
    UploadAnnotationMetadataResponse,
    UploadNeuronAnnotationMetadataMutation
} from "../../graphql/neuron";
import {lookupBrainAreaByAllenId} from "../App";

const dropZoneStyle = (haveFile: boolean) => {
    return {
        order: 0,
        height: "300px",
        padding: "8px",
        backgroundColor: haveFile ? "white" : "rgb(255, 230, 230)"
    }
}

interface IManageAnnotationProps {
    show: boolean;
    neuron: INeuron;

    onClose(): void;
}

interface IManageAnnotationState {
    file?: File;
    fileContents: string;
    isFileAlertOpen?: boolean;
    invalidFileName?: string;
}

async function onUploadComplete(data: UploadAnnotationMetadataResponse, onClose: () => void) {
    toast.success(uploadSuccessContent(data.uploadAnnotationMetadata), {});

    onClose();
}

async function onUploadError(error: ApolloError) {
    console.log(error);

    toast.error(uploadErrorContent(error), {autoClose: false});
}

export const ManageAnnotation = (props: IManageAnnotationProps) => {
    const [state, setState] = useState({
        file: null,
        fileContents: "",
        isFileAlertOpen: false,
        invalidFileName: false
    });

    function onDrop(acceptedFiles: File[]) {
        if (acceptedFiles && acceptedFiles.length > 0) {
            const reader = new FileReader();

            reader.onload = async (e) => {
                const text = (e.target.result);
                setState({...state, file: acceptedFiles[0], fileContents: text.toString()});
            };

            reader.readAsText(acceptedFiles[0])
        } else {
            setState({...state, file: null, fileContents: ""});
        }
    }

    async function onUploadNeuronAnnotationMetadataMutation(uploadNeuronAnnotationMetadata: any) {
        try {
            uploadNeuronAnnotationMetadata({
                variables: {
                    neuronId: props.neuron.id,
                    file: state.file
                }
            });
        } catch (error) {
            toast.error(uploadErrorContent(error), {autoClose: false});
        }
    }

    const annotationData: IParsedAnnotationMetadata = parseNeuronAnnotationMetadata(props.neuron);

    let annotationDataContent = (<div>{"(none)"}</div>);

    if (annotationData?.somaCompartmentId) {
        const brainArea = lookupBrainAreaByAllenId(annotationData?.somaCompartmentId);

        annotationDataContent = (<div>
            <b>Soma Compartment Id:</b> {brainArea.name} ({annotationData?.somaCompartmentId})
        </div>);
    }

    let previewContent = (<div>{"Click or drag & drop to select an annotation metadata file"}</div>)

    if (state.fileContents.length > 0) {
        const previewAnnotationData: IParsedAnnotationMetadata = parseAnnotationMetadata(state.fileContents);

        try {
            const brainArea = lookupBrainAreaByAllenId(previewAnnotationData.somaCompartmentId);

            previewContent = (<div>
                <h4>Preview</h4>
                <b>Soma Compartment Id:</b> {brainArea.name} ({previewAnnotationData.somaCompartmentId})
            </div>);
        } catch {
            previewContent = (<div>{"Could not parse annotation metadata file"}</div>)
        }
    }

    return (
        <Modal closeIcon centered={false} open={props.show} onClose={props.onClose} dimmer="blurring">
            <Modal.Header content={`Annotations for ${displayNeuron(props.neuron)}`}/>
            <Modal.Content>
                <Segment placeholder>
                    <Grid columns={2} stackable textAlign='center'>
                        <Divider vertical/>
                        <Grid.Row verticalAlign='middle'>
                            <Grid.Column>
                                <Dropzone className="dropzone-no-border" style={dropZoneStyle(state.file)} onDrop={(accepted: File[]) => onDrop(accepted)}>
                                    <span style={NoFileStyle(!state.file, false)}>
                                        {previewContent}
                                    </span>
                                </Dropzone>
                            </Grid.Column>

                            <Grid.Column>
                                <h4>Existing Annotations</h4>
                                {annotationDataContent}
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>
                <UploadNeuronAnnotationMetadataMutation
                    mutation={UPLOAD_NEURON_ANNOTATION_METADATA_MUTATION}
                    onCompleted={(data) => onUploadComplete(data, props.onClose)}
                    onError={(error) => onUploadError(error)}>
                    {(uploadNeuronAnnotationMetadataMutation, {loading}) => {
                        return (
                            <div>
                                <Button content="Upload" icon="upload" size="tiny" labelPosition="right" color="blue"
                                        disabled={!state.file}
                                        onClick={() => onUploadNeuronAnnotationMetadataMutation(uploadNeuronAnnotationMetadataMutation)}/>
                            </div>
                        );
                    }}
                </UploadNeuronAnnotationMetadataMutation>
            </Modal.Content>
            <Modal.Actions>
                <Button color="blue" content="Close" onClick={props.onClose}/>
            </Modal.Actions>
        </Modal>
    )
};

const uploadSuccessContent = (output: UploadAnnotationMetadataMutationData) => {
    return (
        <div>
            <h3>Upload successful</h3>
            {output.error ? "Annotation metadata submission failed" : "Annotation metadata submission successful"}
        </div>
    );
};

const uploadErrorContent = (error: Error) => {
    return (<div><h3>Upload failed</h3>{error ? error.message : "(no additional details available)"}</div>);
};

const NoFileStyle = (isMissing: boolean, loading: boolean) => {
    return {
        display: "flex",
        alignItems: "center",
        textAlign: "center" as TextAlignProperty,
        width: "100%",
        margin: "10px",
        color: (isMissing || loading) ? "rgba(191, 191, 191, 0.870588)" : "black"
    };
};
