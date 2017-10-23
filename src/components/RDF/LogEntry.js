// @flow
import React from 'react';
import RDFComponent from './RDFComponent';

export const IRI = 'http://purl.bdrc.io/ontology/admin/LogEntry';

export default class LogEntry extends RDFComponent {

    getLogString(): string {
        const IRIs = [
            'http://purl.bdrc.io/ontology/admin/logDate',
            'http://purl.bdrc.io/ontology/admin/logMessage'
        ];

        return this.joinProps(IRIs, ': ');
    }

    render() {
        const log = this.getLogString();

        return (
            <p onClick={this.props.onClick}>{log}</p>
        )
    }
}