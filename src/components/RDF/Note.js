// @flow
import React from 'react';
import RDFComponent from './RDFComponent';

export const IRI = 'http://purl.bdrc.io/ontology/core/Note';

export default class Note extends RDFComponent {

    getNoteString(): string {
        const IRIs = [
            'http://purl.bdrc.io/ontology/core/noteText',
            'http://purl.bdrc.io/ontology/core/noteLocationStatement',
            'http://purl.bdrc.io/ontology/core/noteWork'
        ];

        return this.joinProps(IRIs, '; ');
    }

    render() {
        const note = this.getNoteString();

        return (
            <p onClick={this.props.onClick}>{note}</p>
        )
    }
}