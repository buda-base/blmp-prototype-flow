import React, { Component } from 'react';
import './App.css';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Button from 'material-ui/Button';
import Drawer from 'material-ui/Drawer';
import { ListItem } from 'material-ui/List';

import SplitPane from 'react-split-pane';
import IndividualEditor from './IndividualEditor'
import Preview from './Preview'
import IndividualHeading from './IndividualHeading';
import Serializer from '../lib/Serializer'
import API from '../api/api';

const DEFAULT_OBJECT_ID = 'G844';

class App extends Component {
    _rootIRI = 'http://purl.bdrc.io/ontology/';
    _mainSplitPane = null;
    _mainSplitPaneWidth = 600;
    _api: API;

    constructor(props) {
        super(props);

        this.state = {
            ontology: null,
            individual: null,
            graphText: null,
            hidePreview: false,
            splitWidth: this._mainSplitPaneWidth
        };

        this._api = new API();

        this.init();
    }

    async init() {
        const ontology = await this._api.getOntology();
        console.log('ontology: %o', ontology);
        let place = await this._api.getResource(DEFAULT_OBJECT_ID);
        console.log('place: %o', place);
        this.setState((prevState, props) => {
            return {
                ...prevState,
                ontology,
                individual: place
            }
        });
    }

    updateGraphText() {
        let serializer = new Serializer();
        const baseURI = 'http://purl.bdrc.io/ontology/core/';
        serializer.serialize(this.state.individual, baseURI, this.state.individual.namespaces)
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
        if (!this.state.graphText && this.state.individual) {
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
            this.setState((prevState, props) => {
                let visibleWidth = this._mainSplitPaneWidth;
                if (this._mainSplitPane) {
                    if (!prevState.hidePreview) {
                        this._mainSplitPaneWidth = this._mainSplitPane.state.draggedSize;
                    } else {
                        visibleWidth = this._mainSplitPaneWidth;
                    }
                }
                const width = (prevState.hidePreview) ? visibleWidth : '100%';
                return {
                    ...prevState,
                    hidePreview: !(prevState.hidePreview),
                    splitWidth: width
                }
            });

        };

        return (
            <div className="App">
                <SplitPane
                    split="vertical"
                    minSize={350}
                    size={this.state.splitWidth}
                    allowResize={true}
                    ref={(split) => this._mainSplitPane = split}
                >
                    <SplitPane split="horizontal" size={90} allowResize={false}>
                        <div>
                            <IndividualHeading individual={this.state.individual} />
                            <Button raised style={previewToggleStyle} onClick={toggleShowPreview}>{(this.state.hidePreview ? "Show" : "Hide") +  " Preview"}</Button>
                        </div>
                        <IndividualEditor
                            individual={this.state.individual}
                            ontology={this.state.ontology}
                            onIndividualUpdated={onIndividualUpdated}
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
            </div>
        );
    }
}

export default App;
