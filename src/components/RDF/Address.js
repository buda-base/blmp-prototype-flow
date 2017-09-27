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

        const addressComponents = IRIs.map((propIRI) => {
            const values = this.props.individual.getProperty(propIRI);
            if (values) {
                return values.map(value => value.value).join(', ');
            }
            return null;
        });

        return addressComponents.join(', ');
    }

    render() {
        const address = this.getAddressString();
        return (
            <p>{address}</p>
        )
    }
}

