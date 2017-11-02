import React, { Component } from 'react';
import './IndividualEditor.css';
import IndividualViewContainer from 'containers/IndividualViewContainer';

export default class IndividualEditor extends Component {
    constructor(props) {
        super(props);
    }

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

        return(
            <div className="individualEditor">
                {editor}
            </div>
        )
    }
}