// @flow
// import * as ui from '../state/ui/actions';
// import store from 'index';
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

import Button from '@material-ui/core/Button';
import Ontology from 'lib/Ontology';
import RDFProperty from 'lib/RDFProperty';
import Individual from 'lib/Individual';

import {auth} from "../routes"

// import SHACLValidator from "shacl-js"
// import * as rdf from 'rdflib';
// import N3Parser from 'rdf-parser-n3';
// import jsonldSerializer from 'rdf-serializer-jsonld';
// import JsonLdSerializerExt from 'rdf-serializer-jsonld-ext';
// import rdfext from 'rdf-ext';
// import stringToStream from 'string-to-stream';

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
    graphId:string | null,
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
      if(this.updaSpli !== 0) clearTimeout(this.updaSpli);
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
      if(this.updaSuSpli !== 0) clearTimeout(this.updaSuSpli);
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

        console.log("updateGraph",this.props.individual)

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

    // with SHACL validation - WIP 

    /*

    updateGraphText() {

        if (!this.props.individual) {
            return;
        }

        console.log("updateGraph",this.props.individual,this.props.config.ldspdi)

        let serializer = new Serializer();
        const baseURI = 'http://purl.bdrc.io/ontology/core/';
        serializer.serialize(this.props.individual, baseURI, this.props.individual.namespaces)
            .then(async (str) => {

               let shapes = (await (await fetch( this.props.config.ldspdi.endpoints[this.props.config.ldspdi.index] + "/shape/"
                                                 +this.props.individual.types[0].replace(/^.*?[/]([^/]+)$/,"$1"))).text())


            
            //    let store = rdf.graph()

            //    let n3res ;
            //    rdf.parse(shapes, store, "tmp:shape", "text/n3", (error, n3res) => {
            //        if (!error) {
            //           console.log("n3",n3res)

            //            rdf.serialize(shapes, n3res, "tmp:shape", "application/ld+json", (error2, res) => {
            //               if (!error2) {
            //                   console.log("jsonld",res) // not working...?
            //               }
            //               else {
            //                   console.error(error2);
            //               }

            //            })
            //        }
            //    });
            

               let parser = new N3Parser({factory: rdf});
               let quadStream = parser.import(stringToStream(shapes));

               
            //    let serializer = new jsonldSerializer();
            //    let jsonldStream = serializer.import(quadStream);
            //    let jsonld = '';
            //    jsonldStream.on('data', data => console.log('jsonld', data)); // outputs an flat array
               

               let serializer = new JsonLdSerializerExt({flatten:true})
               let jsonldStream = serializer.import(quadStream)
               jsonldStream.on('data', data => console.log("data",data));  // outputs a @graph


               let that = this

               var validator = new SHACLValidator();
                  validator.validate(str, "text/turtle", shapes, "text/turtle", function (e, report) {

                      let rep = "# Conforms? " + report.conforms()

                      console.log(rep, report, validator);

                      if (report.conforms() === false) {
                          report.results().forEach(function(result) {
                              rep += "\n# - Severity: " + result.severity() + " for " + result.sourceConstraintComponent();
                          });
                      }

                      that.setState((prevState, props) => {

                           return {
                               ...prevState,
                               graphText: rep+"\n\n"+str,
                               graphId:that.props.individual._id
                           }
                      });
                  });

            });

    }

    */

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

            //this.updateGraphText();

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

        //if (this.props.individual && (!this.state.graphText || this.props.individual.id !== this.state.graphId) ) { /* WIP SHACL */        
        if (!this.state.graphText && this.props.individual) {
            this.updateGraphText();
        }

         //console.log("tabrender",this.props,this.state)

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
                { (!auth.isAuthenticated() || !this.props.editingResource) &&
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
                { auth.isAuthenticated() && this.props.editingResource &&

                      <SplitPane
                         split="vertical"
                         minSize={350}
                         onChange={ this.updateSplitWidth.bind(this) }
                         size={ this.props.splitWidth }
                         allowResize={true}
                         ref={(split) => this._mainSplitPane = split}
                         >
                            <SplitPane split="horizontal" size={90} allowResize={false} >
                               <div className="inDivHeading" >
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
                                    <Button raised style={previewToggleStyle} onClick={toggleShowPreview}>{(this.props.hidePreview ? "Show" : "Hide") +  " TTL CODE"}</Button>
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
