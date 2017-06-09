import React, { Component } from 'react';
import './IndividualEditor.css';
import IndividualView from './IndividualView';

export default class IndividualEditor extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let editor;
        let individual = this.props.individual;
        if (individual) {
            editor = <IndividualView
                individual={individual}
                isEditable={true}
                isExpanded={true}
                ontology={this.props.ontology}
                nested={false}
            />
        } else {
            editor = <div>Nothing selected</div>
        }

        return(
            <div className="individualEditor">
                {editor}
            </div>
        )
    }
}