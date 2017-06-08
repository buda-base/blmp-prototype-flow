// @flow
import React from 'react';
import './IndividualView.css';
import Literal from '../lib/Literal';
import Individual from '../lib/Individual';
import LiteralView from './LiteralView';
import formatIRI from '../lib/formatIRI';
import classnames from 'classnames';

// Material-UI
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
import AddCircle from 'material-ui/svg-icons/content/add-circle';
import {red800, green800} from 'material-ui/styles/colors';

const iconSizes = {
    small: {
        width: 20,
        height: 20
    }
};

export default class IndividualView extends React.Component {
    _editableIndividuals = [];

    constructor(props) {
        super(props);
    }

    addProperty(propertyType: string) {
        const ontology = this.props.ontology;
        const individual = this.props.individual;
        const type = individual.types[0];
        const properties = ontology.getClassProperties(type);
        const property = properties.find((prop) => prop.name === propertyType);
        if (!property || property.ranges.length === 0) {
            return;
        }

        const propertyRange = property.ranges[0];
        if (ontology.isClass(propertyRange)) {
            const propertyIndividual = new Individual();
            propertyIndividual.addType(propertyRange);
            this._editableIndividuals.push(propertyIndividual);
            individual.addProperty(propertyType, propertyIndividual);
        } else {
            const ranges = ontology.getPropertyRanges(propertyType);
            const literal = new Literal(ranges[0], '');
            individual.addProperty(propertyType, literal);
        }
        this.forceUpdate();
    }

    getAvailableProperties() {
        const ontology = this.props.ontology;
        const individual = this.props.individual;
        const type = individual.types[0];
        const properties = ontology.getClassProperties(type);

        return properties;
    }

    render() {
        let title;
        let subtitle;
        if (this.props.individual.id) {
            title = formatIRI(this.props.individual.id);
        } else {
            title = <i>&lt;no id&gt;</i>;
        }
        subtitle = formatIRI(this.props.individual.types[0]);
        let rows = [];
        if (this.props.isExpanded || true) {
            let properties = this.props.individual.getProperties();
            if (this.props.isEditable) {
                let availableProps = this.getAvailableProperties().reduce((propsObject, property) => {
                    if (!properties[property.name]) {
                        propsObject[property.name] = [];
                    }
                    return propsObject;
                }, {});

                properties = {
                    ...properties,
                    ...availableProps
                };
            }

            for (let propertyType in properties) {
                const onTap = (event) => {
                    this.addProperty(propertyType);
                };
                rows.push(<Subheader>
                    {formatIRI(propertyType)}
                    {this.props.isEditable &&
                    <IconButton
                        iconStyle={iconSizes.small}
                        onTouchTap={onTap.bind(this)}
                    >
                        <AddCircle color={green800}/>
                    </IconButton>
                    }
                </Subheader>);
                let propertyValues = properties[propertyType];
                for (let propertyValue of propertyValues) {
                    let view;
                    if (propertyValue instanceof Literal) {
                        view = <LiteralView literal={propertyValue}
                                            isEditable={this.props.isEditable}
                        />;
                    } else if (propertyValue instanceof Individual) {
                        const isEditable = (this._editableIndividuals.indexOf(propertyValue) !== -1);
                        view = <IndividualView individual={propertyValue}
                                               isExpanded={isEditable}
                                               isEditable={isEditable}
                                               ontology={this.props.ontology}
                        />;
                    }
                    rows.push(<ListItem>{view}</ListItem>);
                }
            }
        }

        let classes = ["individualView"];
        if (this.props.isEditable) {
            classes.push("isEditable");
        }
        if (this.props.isExpanded) {
            classes.push("isExpanded");
        }
        return (
            <div className={classnames(...classes)}>
                <Card initiallyExpanded={this.props.isExpanded}>
                    <CardHeader
                        title={title}
                        subtitle={subtitle}
                        showExpandableButton={rows.length > 0}
                    />
                    {rows.length > 0 &&
                    <CardText expandable={true}>
                        <List>
                            {rows}
                        </List>
                    </CardText>
                    }
                </Card>
            </div>
        );
    }
}