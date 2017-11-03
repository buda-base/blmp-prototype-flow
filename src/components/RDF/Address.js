// @flow
import React from 'react';
import RDFComponent from './RDFComponent';

export const IRI = 'http://www.w3.org/2006/vcard/ns#Address';

export default class Address extends RDFComponent {
    _IRI: string = IRI;

    getAddressString(): string {
        const IRIs = [
            'http://www.w3.org/2006/vcard/ns#street-address',
            'http://www.w3.org/2006/vcard/ns#locality',
            'http://www.w3.org/2006/vcard/ns#region',
            'http://www.w3.org/2006/vcard/ns#postal-code',
            'http://www.w3.org/2006/vcard/ns#country-name',
        ];

        return this.joinProps(IRIs);
    }

    render() {
        let properties = this.props.individual.getProperties();
        let address = "<no properties>";
        if (Object.keys(properties).length > 0) {
            address = this.getAddressString();
        }
        return (
            <p onClick={this.props.onClick}>{address}</p>
        )
    }
}

