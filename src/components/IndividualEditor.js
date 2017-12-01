import React, { Component } from 'react';
import './IndividualEditor.css';
import IndividualViewContainer from 'containers/IndividualViewContainer';

import ReactDOM from 'react-dom';



export default class IndividualEditor extends Component {
   //_IRI : null
   
   /*
   componentWillMount()
   {
        console.groupCollapsed("EDITOR")
        console.log("debut edi") 
    }    
    
   componentDidMount()
   {
        console.log("fin edi") 
        console.groupEnd();
    }
   
   componentWillUpdate()
   {
        console.groupCollapsed("UPDATeditor")
        console.log("debut updatEdi") 
    }    
    
   componentDidUpdate()
   {
        console.log("fin updatEdi") 
        console.groupEnd();
    }
    */
    
    /*
    shouldComponentUpdate(nextProps, nextState) 
    {
       console.log("UPDATE?",this.props)
       if(this.props.individual.id != this._IRI)
       {        
          this._IRI = this.props.individual.id;
//           this.forceUpdate()
          this.render();
          return true ; 
       }
       return false ;
    }
    */
    
    render() {
       
        
        let editor;
        let individual = this.props.individual;
        if (individual) {
            editor = <IndividualViewContainer
                individual={individual}
                isEditable={true}
                isExpandable={true}
                isExpanded={true}
                level={0}
                nested={false}
                ontology={this.props.ontology}
                onIndividualUpdated={this.props.onIndividualUpdated}
                onAddResource={this.props.onAddResource}
            />
        } else {
            editor = <div>Nothing selected</div>
        }

        let ret = (
            <div className="individualEditor">
                {editor}
            </div>
        )
        return ret ;
    }
     
       
}