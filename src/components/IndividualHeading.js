import React from 'react';
import formatIRI from '../lib/formatIRI';
import './IndividualHeading.css';
import LiteralView from './LiteralView';


const prefix = {
    'C': 'Corporation', //
    'UT': 'Etext',
    'I': 'Item',
    'L': 'Lineage',
    'R': 'Office',  //
    'P': 'Person',
    'G': 'Place',
    'PR': 'Product', //
    'T': 'Topic',
    'W': 'Work'
}


export default class IndividualHeading extends React.Component {

    constructor(props) {
        super(props);
    }

    get title() {
        let title = "";
        if (this.props.individual) {
            let labels = this.props.individual.getProperty("http://www.w3.org/2000/01/rdf-schema#label");
            if (labels) {
                title = labels[0].value;
            } else if (this.props.individual.id) {
                title = formatIRI(this.props.individual.id);
            } else {
                title = <i>&lt;no id&gt;</i>;
            }
        }

        return title;
    }

    get subtitle() {
        let subtitle = "";
        
//         console.log(prefix,this.props.individual.id);
        
        if (this.props.individual) { // && this.props.individual.types[0]) {
           subtitle = prefix[formatIRI(this.props.individual.id).charAt(0)]
           if(subtitle == undefined) subtitle = "?" ;
        }
        
//         subtitle = formatIRI(this.props.individual.types[0]);
        
        return subtitle;
    }

    render() {
    
         let pref = []
               
         let lab = this.props.individual.getProperty("http://www.w3.org/2004/02/skos/core#prefLabel") ;
         //console.log("label",lab[0])
         
         for(var l of lab) {
            pref.push( 
            <LiteralView literal={l} isEditable={false} noPrefix={true} />
                        );
         }
         
               
        return (
            [ <div className="IndividualHeading">
                <h1>{this.title}</h1>
                <h2>{this.subtitle}</h2>
            </div>,
                  <div><div className="prefLabel">{pref}</div></div>
            ]
        );
    }
}
