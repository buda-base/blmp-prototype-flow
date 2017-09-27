// @flow
import React from 'react';
import Individual from '../../lib/Individual';

// Every RDFComponent should export it's IRI.
export const IRI = 'http://purl.bdrc.io/component/RDFComponent';

type Props = {
    individual: Individual
}

export default class RDFComponent extends React.Component<Props> {
    _IRI = IRI;
    _individual: Individual;

    constructor(props: Props) {
        super(props);

        this._individual = props.individual;
    }

    get IRI(): string {
        return this._IRI;
    }
}

