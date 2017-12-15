// @flow
import React from 'react';
import Ontology from 'lib/Ontology';
import Individual from 'lib/Individual';
import IndividualView from 'components/IndividualView';
import Loader from 'react-loader';
import './ResourceView.css';
import formatIRI from 'lib/formatIRI';

type Props = {
    IRI?: string,
    individual?: Individual,
    ontology: Ontology,
    failure?: []
}

export default class ResourceView extends React.Component<Props> {

    render() {
        let view;
        
        console.log("rView",this.props);
        
        if (!this.props.IRI) {
            view = <p className="statusMessage">Nothing selected.</p>
        }  
        else if (!this.props.resource) {
           
            if(!this.props.failure) {
               
               view = <div className="statusMessage">
                  <Loader loaded={false} />
                  <p>     Loading...</p>
               </div>
               
            }
            else {
               
               view = <div className="statusMessage">
                  <p>{formatIRI(this.props.IRI)} : {this.props.failure}</p>
               </div>
               
            }
         } else {
            view = <IndividualView
                individual={this.props.resource}
                isExpanded={true}
                isEditable={false}
                isExpandable={true}
                nested={true}
                level={0}
                ontology={this.props.ontology}
            />
        }

        return (
            <div>
                {view}
            </div>
        )
    }
}
