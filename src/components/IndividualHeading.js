import React from 'react';
import formatIRI from '../lib/formatIRI';
import './IndividualHeading.css';

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
        if (this.props.individual && this.props.individual.types[0]) {
            subtitle = formatIRI(this.props.individual.types[0]);
        }

        return subtitle;
    }

    render() {
        return (
            <div className="IndividualHeading">
                <h1>{this.title}</h1>
                <h2>{this.subtitle}</h2>
            </div>
        );
    }
}
