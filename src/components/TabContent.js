// @flow
import * as ui from '../state/ui/actions';
import store from 'index';
import React, { Component } from 'react';

import SplitPane from 'react-split-pane';
import IndividualEditor from './IndividualEditor';
// import IndividualEditorContainer from 'containers/IndividualEditorContainer';
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
    addedFoundResource?: boolean,
    addingResource: AddingResource,
    findingResourceId: string,
    findingResource: Individual,
    findingResourceError: string,
    searchingResource: string,
    results:[],
    config:{},
    saving:boolean,
    hostError:string|null,
    onOpenedResource: (resource: Individual) => void,
    onSelectedResource: (IRI: string) => void,
    onAddResource: (indvidual: Individual, property: RDFProperty) => void,
    onCancelAddingResource: () => void,
    onFindResource: (id: string) => void,
    onSearchResource: (id: string) => void,
    onAddedProperty: () => void,
    onLoadedConfig: (config: {}) => void,
    onResizeCentralPanel: (tabId: number) => void,
    onResizePreviewPanel: (tabId: number) => void
}

type State = {
    reset:boolean,
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
    _graphTextIRI = null ;
    _cache = {} ;

    // cancellers for timeouts
    updaSpli = 0 ;
    updaSuSpli = 0 ;


    constructor(props: Props) {
        super(props);


        this.state = {
            reset:false,
            graphText: null,
            hidePreview: false,
            splitWidth: this._mainSplitPaneWidth,
            subSplitWidth: this._secondarySplitPaneWidth,
        };

    }


    componentDidUpdate(prevProps, prevState)
    {/*
       if(this._graphTextIRI != this.props.editingResourceIRI)
       {
         this.updateGraphText();
         this.prepareRender()
         this._graphTextIRI = this.props.editingResourceIRI ;

      }*/

    }


    updateSplitWidth(width : number)
    {
      if(this.updaSpli != 0) clearTimeout(this.updaSpli);
      this.updaSpli = setTimeout((function(that,wid)
      {
         return function() {
            //console.log("timeo",that,wid);

            that.props.onResizeCentralPanel(wid)

            /*// react state version
            that.setState((prevState: State, props: Props) => {
                  return {
                     ...prevState,
                     splitWidth:wid
                  }
            })}

            */

         }})(this,width), 500) ;
    }

    updateSubSplitWidth(width : number) {
      if(this.updaSuSpli != 0) clearTimeout(this.updaSuSpli);
      this.updaSuSpli = setTimeout((function(that,wid)
      {
         return function() {
            //console.log("timeo",that,wid);

            that.props.onResizePreviewPanel(wid)

            /* // react state version
            that.setState((prevState: State, props: Props) => {
                  return {
                     ...prevState,
                     subSplitWidth:wid
                  }
            })}

            */
         }})(this,width), 500) ;
    }


    updateGraphText() {

        if (!this.props.individual) {
            return;
        }

        //console.log("updateGraph",this.props.individual)

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

    resetRender()
    {
      this.setState({reset:true})
      this._cache[this.props.editingResourceIRI] = false
      this.prepareRender()
      this._cache[this.props.editingResourceIRI] = false
    }

    prepareRender()
    {

        let onIndividualUpdated = () =>
        {
           // console.log("updating...")
            this.updateGraphText();
            this.resetRender();
        };


        if(this.props.editingResource && this.props.editingResourceIRI)
        {
            let ref = this.props.editingResourceIRI

            // console.log("cache",this.props.editingResourceIRI,this._cache)

            this._cache[ref] = this._cache[ref] ||
               <IndividualEditor
                  individual={this.props.individual}
                  ontology={this.props.ontology}
                  onIndividualUpdated={onIndividualUpdated}
                  onAddResource={this.props.onAddResource}
               />
       }
   }

    render() {
        if (!this.state.graphText && this.props.individual) {
            this.updateGraphText();
        }

        // console.log("tabrender",this.props)

        if(this.props.addedFoundResource) this._cache[this.props.editingResourceIRI] = false
        this.prepareRender()

         // first react state version :
         //    onChange={ console.log("resize",this.state.splitWidth) }
         //    onChange={ this.updateSplitWidth.bind(this) }
         // first redux version :
         //    onChange={ width => this.props.onResizeCentralPanel(width) }

                 const previewToggleStyle = {
                     position: 'absolute',
                     top: '20px',
                     right: '0px'
                 };

                 const toggleShowPreview = () => {

                     this.props.onTogglePreviewPanel();
                  };


         let ret = (
            <div className="TabContent">
                { (!this.props.logged || !this.props.editingResource) &&
                    <div className="tabResourceSelector">
                        <ResourceSelector
                            logged={this.props.logged}
                            isDialog={false}
                            selectedResource={this.props.onOpenedResource}
                            findResource={this.props.onFindResource}
                            searchResource={this.props.onSearchResource}
                            searchingResource={this.props.searchingResource}
                            results={this.props.results}
                            config={this.props.config}
                            cancel={this.props.onCancelAddingResource}
                            editingResourceIRI={this.props.editingResourceIRI}
                            findingResourceId={this.props.findingResourceId}
                            findingResource={this.props.findingResource}
                            findingResourceError={this.props.findingResourceError}
                            hostError={this.props.hostError}
                            ontology={this.props.ontology}
                        />
                    </div>
                }
                { this.props.logged && this.props.editingResource &&

                      <SplitPane
                         split="vertical"
                         minSize={350}
                         onChange={ this.updateSplitWidth.bind(this) }
                         size={ this.props.splitWidth }
                         allowResize={true}
                         ref={(split) => this._mainSplitPane = split}
                         >
                            <SplitPane split="horizontal" size={90} allowResize={false} >
                               <div className="inDivHeading">
                                  <IndividualHeading individual={this.props.individual} loaded={!this.props.saving} />
                               </div>
                               <div>
                               {
                                  this._cache[this.props.editingResourceIRI]
                               }
                               {this.props.addingResource &&
                                    <ResourceSelector
                                        logged={this.props.logged}
                                        isDialog={true}
                                        individual={this.props.addingResource.individual}
                                        property={this.props.addingResource.property}
                                        findResource={this.props.onFindResource}
                                        cancel={this.props.onCancelAddingResource}
                                        editingResourceIRI={this.props.editingResourceIRI}
                                        findingResourceId={this.props.findingResourceId}
                                        findingResource={this.props.findingResource}
                                        findingResourceError={this.props.findingResourceError}
                                        ontology={this.props.ontology}
                                        searchResource={this.props.onSearchResource}
                                        searchingResource={this.props.searchingResource}
                                        results={this.props.results}
                                        config={this.props.config}
                                        hostError={this.props.hostError}
                                        addedProperty={() => {
                                            this.props.onAddedProperty();
                                            this.updateGraphText();
                                            this.prepareRender()
                                        }}
                                    />
                               }
                            </div>
                        </SplitPane>
                        <SplitPane
                            minSize={350}
                           onChange={ this.updateSubSplitWidth.bind(this) }
                           size={ this.props.hidePreview?"100%":this.props.subSplitWidth  }
                            allowResize={true}
                            ref={(split) => this._secondarySplitPane = split} >
                            <SplitPane split="horizontal" size={90} allowResize={false} >
                               <div>
                                    <Button raised style={previewToggleStyle} onClick={toggleShowPreview}>{(this.props.hidePreview ? "Show" : "Hide") +  " Preview"}</Button>
                               </div>
                               <ResourceViewContainer
                                    ontology={this.props.ontology}
                               />
                            </SplitPane>
                            <SplitPane split="horizontal" size={90} allowResize={false} >
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


            </div> )

            // console.log("render finished",this.props)
            return ret ;
    }
}

export default TabContent;
