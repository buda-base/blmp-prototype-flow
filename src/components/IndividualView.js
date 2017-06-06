import React from 'react';
import './IndividualView.css';
import Literal from '../lib/Literal';
import LiteralView from './LiteralView';
import formatIRI from '../lib/formatIRI';

const IndividualView = props => {
    let label;
    if (props.individual.id) {
        label = formatIRI(props.individual.id);
    } else {
        label = <i>{formatIRI(props.individual.types[0])}</i>;
    }

    let content = label;
    if (props.isExpanded) {
        content = [content];
        const properties = props.individual.getProperties();
        for (let propertyType in properties) {
            let propertyValues = properties[propertyType];
            for (let propertyValue of propertyValues) {
                if (propertyValue instanceof Literal) {
                    content.push(<LiteralView literal={propertyValue}/>);
                } else if (propertyValue instanceof Literal) {
                    content.push(<IndividualView individual={propertyValue}/>)
                }
            }
        }
    }
    return (
        <div className="individualView">
            {content}
        </div>
    );
};

export default IndividualView;