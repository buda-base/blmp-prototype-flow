// @flow
import React, { Component } from 'react';

import SplitPane from 'react-split-pane';
import IndividualEditor from './IndividualEditor';
import Preview from './Preview';
import IndividualHeading from './IndividualHeading';
import ResourceViewContainer from 'containers/ResourceViewContainer';
import ResourceSelector from 'components/ResourceSelector';
import Serializer from '../lib/Serializer';

import type { AddingResource } from 'state/ui/actions';

import Button from 'material-ui/Button';
import Ontology from 'lib/Ontology';
import RDFProperty from 'lib/RDFProperty';
import Individual from 'lib/Individual';

import './TabContent.css';

type Props = {
    ontology: Ontology,
    editingResourceIRI?: string,
    editingResource?: Individual,
    editingResourceIsLoading?: boolean,
    editingResourceError?: string,
    individual?: Individual,
    selectedResourceIRI: string,
    addingResource: AddingResource,
    findingResourceId: string,
    findingResource: Individual,
    findingResourceError: string,
    onSelectedResource: (IRI: string) => void,
    onAddResource: (indvidual: Individual, property: RDFProperty) => void,
    onCancelAddingResource: () => void,
    onFindResource: (id: string) => void,
    onAddedProperty: () => void
}

type State = {
    graphText: string | null,
    hidePreview: boolean,
    splitWidth: number,
    subSplitWidth: string | number
}

class TabContent extends Component<Props, State> {
    _mainSplitPane = null;
    _mainSplitPaneWidth = 600;
    _secondarySplitPane = null;
    _secondarySplitPaneWidth = 350;

    constructor(props: Props) {
        super(props);

        this.state = {
            graphText: null,
            hidePreview: false,
            splitWidth: this._mainSplitPaneWidth,
            subSplitWidth: this._secondarySplitPaneWidth,
        };
    }

    updateGraphText() {
        if (!this.props.individual) {
            return;
        }
        let serializer = new Serializer();
        const baseURI = 'http://purl.bdrc.io/ontology/core/';
        serializer.serialize(this.props.individual, baseURI, this.props.individual.namespaces)
            .then((str) => {
                this.setState((prevState, props) => {
                    return {
                        ...prevState,
                        graphText: str
                    }
                });
            });   
    }

    render() {
        if (!this.state.graphText && this.props.individual) {
            this.updateGraphText();
        }

        let onIndividualUpdated = () => {
            this.updateGraphText();
        };

        const previewToggleStyle = {
            position: 'absolute',
            top: '20px',
            right: '0px'
        };

        const toggleShowPreview = () => {
            this.setState((prevState: State, props: Props) => {
                let visibleWidth = this._secondarySplitPaneWidth;
                if (this._secondarySplitPane) {
                    if (!prevState.hidePreview) {
                        this._secondarySplitPaneWidth = this._secondarySplitPane.state.draggedSize;
                    } else {
                        visibleWidth = this._secondarySplitPaneWidth;
                    }
                }
                const width = (prevState.hidePreview) ? visibleWidth : '100%';
                return {
                    ...prevState,
                    hidePreview: !(prevState.hidePreview),
                    subSplitWidth: width
                }
            });

        };

        return (
            <div className="TabContent">
                <div>
                    {this.props.editingResource === null &&
                        <p>Nothing selected.</p>
                        // TODO: add resource selector
                    }
                    {this.props.editingResource &&
                        <SplitPane
                        split="vertical"
                        minSize={350}
                        size={this.state.splitWidth}
                        allowResize={true}
                        ref={(split) => this._mainSplitPane = split}
                        >
                            <SplitPane split="horizontal" size={90} allowResize={false}>
                                <div>
                                    <IndividualHeading individual={this.props.individual} />
                                </div>
                                <div>
                                    <IndividualEditor
                                        individual={this.props.individual}
                                        ontology={this.props.ontology}
                                        onIndividualUpdated={onIndividualUpdated}
                                        onAddResource={this.props.onAddResource}
                                    />
                                    {this.props.addingResource &&
                                        <ResourceSelector 
                                            isOpen={true}
                                            individual={this.props.addingResource.individual}
                                            property={this.props.addingResource.property}
                                            findResource={this.props.onFindResource}
                                            cancel={this.props.onCancelAddingResource}
                                            findingResourceId={this.props.findingResourceId}
                                            findingResource={this.props.findingResource}
                                            findingResourceError={this.props.findingResourceError}
                                            ontology={this.props.ontology}
                                            addedProperty={() => {
                                                this.props.onAddedProperty();
                                                this.updateGraphText();
                                            }}
                                        />
                                    }
                                </div>
                            </SplitPane>
                            <SplitPane
                                minSize={350}
                                size={this.state.subSplitWidth}
                                allowResize={true}
                                ref={(split) => this._secondarySplitPane = split}
                            >
                                <SplitPane split="horizontal" size={90} allowResize={false}>
                                    <div>
                                        <Button raised style={previewToggleStyle} onClick={toggleShowPreview}>{(this.state.hidePreview ? "Show" : "Hide") +  " Preview"}</Button>
                                    </div>
                                    <ResourceViewContainer 
                                        ontology={this.props.ontology}
                                    />
                                </SplitPane>
                                <SplitPane split="horizontal" size={90} allowResize={false}>
                                    <div className="preview">
                                        <h2>Turtle Preview</h2>
                                    </div>
                                    <Preview
                                        graphText={this.state.graphText}
                                    />
                                </SplitPane>
                            </SplitPane>
                        </SplitPane>
                    }
                </div>
                
            </div>
        );
    }
}

export default TabContent;