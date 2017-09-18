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
import Ontology from '../lib/Ontology';
import Graph from '../lib/Graph'
import Serializer from '../lib/Serializer'

class App extends Component {
    _rootIRI = 'http://purl.bdrc.io/ontology/';
    _mainSplitPane = null;
    _mainSplitPaneWidth = 600;

    constructor(props) {
        super(props);

        this.state = {
            ontology: null,
            graph: null,
            individual: null,
            graphText: null,
            hidePreview: false,
            splitWidth: this._mainSplitPaneWidth
        };

        this.init();
    }

    async init() {
        const [owlText, graphText] = await Promise.all([
            this._fetchText('/bdrc.owl'),
            this._fetchText('/G844.ttl')
        ]);
        const ontology = await this._processOntology(owlText);
        const graph = await this._processGraph(graphText, ontology);
        let place = graph.getIndividualWithId('http://purl.bdrc.io/resource/G844');
        this.setState((prevState, props) => {
            return {
                ...prevState,
                individual: place
            }
        });
    }

    _fetchText(url) {
        const req = new Request(url);
        let text;
        return new Promise((resolve, reject) => {
            fetch(req).then((response) => {
                response.text().then((reqText) => {
                    text = reqText;
                    resolve(text);
                });
            });
        });
    }

    _processOntology(data) {
        const mimeType = 'application/rdf+xml';
        return new Promise((resolve, reject) => {
            try {
                Ontology.create(data, 'http://purl.bdrc.io/ontology/core/', mimeType)
                    .then((ontology) => {
                        this.setState((prevState, props) => {
                            return {
                                ...prevState,
                                ontology: ontology
                            }
                        });
                        resolve(ontology);
                    });

            } catch (e) {
                console.warn('Error processing ontology: %o', e);
                reject(e);
            }
        });
    }

    _processGraph(data, ontology) {
        const mimeType = 'text/turtle';
        return new Promise((resolve, reject) => {
            try {
                Graph.create(data, 'http://purl.bdrc.io/resource/G844', mimeType, ontology)
                    .then((graph) => {
                        this.setState((prevState, props) => {
                            return {
                                ...prevState,
                                graph: graph
                            }
                        });
                        resolve(graph);
                    });
            } catch (e) {
                console.warn('Error processing graph: %o', e);
                reject(e);
            }
        });
    }

    updateGraphText() {
        let serializer = new Serializer();
        const baseURI = 'http://purl.bdrc.io/ontology/core/';
        serializer.serialize(this.state.individual, baseURI, this.state.graph.getNamespaces())
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
