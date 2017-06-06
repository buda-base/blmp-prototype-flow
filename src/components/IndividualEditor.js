import React, { Component } from 'react';
import {List, ListItem} from 'material-ui/List';
import './IndividualEditor.css';
import IconButton from 'material-ui/IconButton';
import AddCircle from 'material-ui/svg-icons/content/add-circle';
import {blue500, red500, green800} from 'material-ui/styles/colors';
import formatIRI from '../lib/formatIRI';
import Literal from '../lib/Literal';
import Individual from '../lib/Individual';
import LiteralView from './LiteralView';
import IndividualView from './IndividualView';

const iconSizes = {
    small: {
        width: 20,
        height: 20
    }
};

export default class IndividualEditor extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let editor;
        let individual = this.props.individual;
        if (individual) {
            let items = [];
            const properties = individual.getProperties();
            for (let property in properties) {
                const propertyValues = properties[property];
                let values = [];
                for (let propertyValue of propertyValues) {
                    let value;
                    if (propertyValue instanceof Literal) {
                        // value = propertyValue.value;
                        value = <LiteralView literal={propertyValue} />
                    } else if (propertyValue instanceof Individual) {
                        value = <IndividualView individual={propertyValue} isExpanded={true} />
                    }
                    values.push(<li className="valueRow">{value}</li>);
                }
                let valuesList = <ul>
                    {values}
                </ul>

                items.push(
                    <li>
                        <h3>
                            {formatIRI(property)}
                            <IconButton iconStyle={iconSizes.small}>
                                <AddCircle color={green800}/>
                            </IconButton>
                        </h3>
                        {valuesList}
                    </li>
                );
            }
            editor = <div>
                        <h2>{individual.id}</h2>
                        <ul>
                            {items}
                        </ul>
                    </div>
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