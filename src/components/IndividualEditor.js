import React, { Component } from 'react';
import {List, ListItem} from 'material-ui/List';
import Literal from '../lib/Literal';
import Individual from '../lib/Individual';

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
                        value = propertyValue.value;
                    } else if (propertyValue instanceof Individual) {
                        if (propertyValue.id) {
                            value = propertyValue.id
                        } else {
                            value = propertyValue.types[0];
                        }

                    }
                    values.push(<li>{value}</li>);
                }
                let valuesList = <ul>
                    {values}
                </ul>

                items.push(
                    <li>
                        <h3>{property}</h3>
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