// @flow
import React from 'react';
import Individual from 'lib/Individual';
import Literal from 'lib/Literal';
import dateFormat from 'dateformat';

// Every RDFComponent should export it's IRI.
export const IRI = 'http://purl.bdrc.io/component/RDFComponent';

type Props = {
    individual: Individual,
    onClick: ?() => void,
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

    joinProps(IRIs: Array<string>, joiner: string = ', '): string {
        const components = IRIs.map((propIRI) => {
            const values = this.props.individual.getProperty(propIRI);
            if (values) {
                return values.map(value => {
                    if (value instanceof Literal && value.isDate) {
                        return dateFormat(value.value, 'mmmm d, yyyy');
                    } else {
                        return value.value;
                    }
                }).join(joiner);
            }
            return null;
        });

        return components.join(joiner);
    }
}

