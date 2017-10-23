// @flow
import React from 'react';
import Ontology from 'lib/Ontology';
import Individual from 'lib/Individual';
import IndividualView from 'components/IndividualView';

type Props = {
    IRI?: string,
    individual?: Individual,
    ontology: Ontology
}

export default class ResourceView extends React.Component<Props> {

    render() {
        let view;
        
        if (!this.props.IRI) {
            view = <p>Nothing selected.</p>
        } else if (!this.props.resource) {
            view = <p>Loading</p>
        } else {
            view = <IndividualView
                individual={this.props.resource}
                isExpanded={true}
                isEditable={false}
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
