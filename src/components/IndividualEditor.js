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
                isExpanded={true}
                isExpandable={true}
                ontology={this.props.ontology}
                nested={false}
                onIndividualUpdated={this.props.onIndividualUpdated}
                level={0}
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