// @flow
import React from 'react';
import './IndividualView.css';
import Literal, { STRING_TYPE } from '../lib/Literal';
import Individual from '../lib/Individual';
import LiteralView from './LiteralView';
import formatIRI from '../lib/formatIRI';
import classnames from 'classnames';
import { DATATYPE_PROPERTY, OBJECT_PROPERTY, ANNOTATION_PROPERTY } from '../lib/Ontology';
import RDFProperty from '../lib/RDFProperty';
import type { RDFComment } from '../lib/RDFProperty';
import capitalize from '../lib/capitalize';

// Material-UI
import List, {ListItem, ListItemText, ListSubheader, ListItemSecondaryAction, ListItemIcon} from 'material-ui/List';
import Collapse from 'material-ui/transitions/Collapse';
import ExpandLess from 'material-ui-icons/ExpandLess';
import ExpandMore from 'material-ui-icons/ExpandMore';
import IconButton from 'material-ui/IconButton';
import AddCircleIcon from 'material-ui-icons/AddCircle';
import RemoveCircleIcon from 'material-ui-icons/RemoveCircle';
import {red, green} from 'material-ui/colors';

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

        this.state = {
            popoversOpen: {},
            popoversEl: {}
        }
    }

    addProperty(propertyType: string) {
        const ontology = this.props.ontology;
        const individual = this.props.individual;
        const type = individual.types[0];
        const properties = ontology.getClassProperties(type);
        const property = properties.find((prop) => prop.IRI === propertyType);
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
        this.props.onIndividualUpdated();
    }

    removeProperty(propertyType: string, value: any) {
        this.props.individual.removeProperty(propertyType, value);
        this.forceUpdate();
        this.props.onIndividualUpdated();
    }

    getAvailableProperties(): {} {
        const ontology = this.props.ontology;
        const individual = this.props.individual;
        const type = individual.types[0];
        const properties = ontology.getClassProperties(type);
        const groupedProps = this.getGroupedProperties(properties);

        return groupedProps;
    }

    getGroupedProperties(properties: RDFProperty[]): {} {
        let dataTypeProps = properties.filter(prop => prop.propertyType === DATATYPE_PROPERTY.value);
        let objectTypeProps = properties.filter(prop => prop.propertyType === OBJECT_PROPERTY.value);
        let annotationTypeProps = properties.filter(prop => prop.propertyType === ANNOTATION_PROPERTY.value);
        const groupedProps = {
            [DATATYPE_PROPERTY.value]: dataTypeProps,
            [OBJECT_PROPERTY.value]: objectTypeProps,
            [ANNOTATION_PROPERTY.value]: annotationTypeProps
        };

        return groupedProps;
    }

    propertyGroupRows(availableProps: RDFProperty[], setProps: {}, headerStyles: {}, itemStyles: {}, removeUnsetProps:boolean=false): Array<mixed> {
        let rows = [];
        let props = {};
        const availablePropsIRIs = availableProps.map(prop => {
            props[prop.IRI] = prop;
            return prop.IRI;
        });
        let existingProps = {};
        for (let propKey in setProps) {
            if (availablePropsIRIs.indexOf(propKey) === -1) {
                continue;
            }
            existingProps[propKey] = setProps[propKey];
        }

        if (!removeUnsetProps) {
            for (let availableProp of availableProps) {
                if (!existingProps[availableProp.IRI] && availableProp.ranges.length > 0) {
                    existingProps[availableProp.IRI] = [];
                }
            }
        }

        for (let propertyType in existingProps) {
            let propertyValues = existingProps[propertyType];
            rows = rows.concat(this.rowsForProperty(props[propertyType], propertyValues, headerStyles, itemStyles));
        }

        return rows;
    }

    rowsForProperty(property: RDFProperty, propertyValues: Array<mixed>, headerStyles: {}, itemStyles: {}): {}[] {
        let rows = [];

        const onTapAdd = (event) => {
            this.addProperty(property.IRI);
        };
        let tooltip = property.comments.map(comment => comment.comment).join('\n\n');
        let title = (property.label) ? capitalize(property.label) : formatIRI(property.IRI);

        const greenColor = {
            fill: green[800]
        };
        const redColor = {
            fill: red[800]
        };

        const propertySubheader = <ListItem>
                {this.props.isEditable &&
                    <ListItemIcon>
                        <IconButton
                            // iconStyle={iconSizes.small}
                            onTouchTap={onTapAdd.bind(this)}
                        >
                            <AddCircleIcon style={greenColor}/>
                        </IconButton>
                    </ListItemIcon>
                }
                <ListItemText title={tooltip} primary={title} disableTypography style={headerStyles} />

            </ListItem>;

        rows.push(propertySubheader);

        for (let propertyValue of propertyValues) {
            let view;
            let isEditable = this.props.isEditable;
            let key = property.IRI + '_';
            let classes = ['individualRow'];
            if (propertyValue instanceof Literal) {
                view = <LiteralView literal={propertyValue}
                                    isEditable={isEditable}
                                    onChange={this.props.onIndividualUpdated}
                />;
                key += propertyValue.uniqueId;
                if (isEditable) {
                    classes.push('individualLiteralRowEditable');
                } else {
                    classes.push('individualLiteralRow');
                }
            } else if (propertyValue instanceof Individual) {
                isEditable = (this._editableIndividuals.indexOf(propertyValue) !== -1);
                view = <IndividualView individual={propertyValue}
                                       isExpanded={isEditable}
                                       isEditable={isEditable}
                                       ontology={this.props.ontology}
                                       nested={true}
                                       onIndividualUpdated={this.props.onIndividualUpdated}
                                       level={this.props.level+1}
                />;
                key += propertyValue.id + '_' + propertyValue.uniqueId;

            }
            const onTapRemove = (event) => {
                this.removeProperty(property.IRI, propertyValue);
            };
            let removeButton = "";
            if (isEditable || this.props.isEditable) {
                removeButton = <IconButton
                    // iconStyle={iconSizes.small}
                    onTouchTap={onTapRemove.bind(this)}
                    className="removeButton"
                >
                    <RemoveCircleIcon style={redColor}/>
                </IconButton>;
            }

            rows.push(<ListItem
                    className={classnames(...classes)}
                    key={key}
                    style={itemStyles}
            >
                {view}
                <ListItemSecondaryAction>{removeButton}</ListItemSecondaryAction>
            </ListItem>);
        }
        return rows;
    }

    idPropertyRows(headerStyles: {}, itemStyles: {}): React.Element<*> {
        const onChange = (value) => {
            this.props.individual.id = value;
            this.forceUpdate();
            this.props.onIndividualUpdated();
        };
        const idLiteral = new Literal(STRING_TYPE, this.props.individual.id);
        const idView = <LiteralView
            literal={idLiteral}
            isEditable={this.props.isEditable}
            onChange={onChange.bind(this)}
        />;

        const subheader = <ListSubheader style={headerStyles}>ID</ListSubheader>;
        const list = <List subheader={subheader}>
            <ListItem key={this.props.individual.id + '_id_row'}>{idView}</ListItem>
        </List>;
        return list;
    }

    render() {
        let title;
        let subtitle;
        let rows = [];

        let labels = this.props.individual.getProperty("http://www.w3.org/2000/01/rdf-schema#label");
        if (labels) {
            title = labels[0].value;
        } else if (this.props.individual.id) {
            title = formatIRI(this.props.individual.id);
        } else {
            title = <i>&lt;no id&gt;</i>;
        }

        if (this.props.individual.types[0]) {
            subtitle = formatIRI(this.props.individual.types[0]);
        } else {
            subtitle = '';
        }

        let listHeaderStyles = {
            paddingLeft: '0px',
            marginLeft: 0,
            color: '#444',
            fontWeight: 'bold'
        };
        if (!this.props.nested) {
            listHeaderStyles = {
                ...listHeaderStyles,
                fontSize: '14px',
                fontWeight: 'bold'
            }
        }
        let listItemStyles = {
            border: 0,
            padding: "0 0 5px 40px",
            display: 'flex',
            alignItems: 'flex-end',
            marginLeft: ((this.props.level + 1) * 20) + 'px'
        };

        if (labels) {
            const subheader = <ListSubheader style={listHeaderStyles}>Labels</ListSubheader>;
            let listItems = labels.map((label, index) => {
                const labelLiteral = new Literal(STRING_TYPE, label.value);
                const labelView = <LiteralView
                    literal={labelLiteral}
                    isEditable={this.props.isEditable}
                />;
                return <ListItem
                    // innerDivStyle={listItemStyles}
                    key={this.props.individual.id + '_label_row_'+index}
                >
                    {labelView}
                </ListItem>
            });

            rows.push(
                <List subheader={subheader}>
                    {listItems}
                </List>
            );
        }

        let removeUnsetProperties = true;
        if (this.props.isEditable) {
            let idRows = this.idPropertyRows(listHeaderStyles, listItemStyles);
            rows = rows.concat(idRows);
            removeUnsetProperties = false;
        }

        let availableProperties = this.getAvailableProperties();
        let dataTypeProps = availableProperties[DATATYPE_PROPERTY.value];
        let objectProps = availableProperties[OBJECT_PROPERTY.value];
        let annotationProps = availableProperties[ANNOTATION_PROPERTY.value];
        let properties = this.props.individual.getProperties();

        const datatypeHeading = (!this.props.nested) ? 'Datatype Properties' : null;
        const datatypeRows = this.propertyGroupRows(dataTypeProps, properties, listHeaderStyles, listItemStyles, removeUnsetProperties);

        const objectHeading = (!this.props.nested) ? 'Object Properties' : null;
        const objectRows = this.propertyGroupRows(objectProps, properties, listHeaderStyles, listItemStyles, removeUnsetProperties);

        const annotationHeading = (!this.props.nested) ? 'Annotation Properties' : null;
        const annotationRows = this.propertyGroupRows(annotationProps, properties, listHeaderStyles, listItemStyles, removeUnsetProperties);

        const propertyTypes = [
            {
                heading: datatypeHeading,
                rows: datatypeRows
            },
            {
                heading: objectHeading,
                rows: objectRows
            },
            {
                heading: annotationHeading,
                rows: annotationRows
            }
        ];

        const headingStyles = {
            fontSize: '21px',
            fontWeight: 'bold',
            padding: '20px 0 20px 0',
            margin: '0'
        };
        
        const dataRowStyle = {
            marginLeft: ((this.props.level + 1) * 20) + 'px'
        };

        for (let propertyData of propertyTypes) {
            if (this.props.nested) {
                // rows.push(propertyData.rows);
                rows.push(
                    <List>
                        <Collapse in={true} style={dataRowStyle}>
                            {propertyData.rows}
                        </Collapse>
                    </List>
                )
            } else {
                rows.push(
                    <List>
                        <ListItem>
                            <ListItemText
                                disableTypography
                                primary={propertyData.heading}
                                style={headingStyles}
                            />
                        </ListItem>
                        <Collapse in={true} style={dataRowStyle}>
                            {propertyData.rows}
                        </Collapse>
                    </List>
                );
            }
        }

        let classes = ["individualView"];
        if (this.props.isEditable) {
            classes.push("isEditable");
        }
        if (this.props.isExpanded) {
            classes.push("isExpanded");
        }
        let titleStyles = {};
        if (this.props.nested) {

        } else {
            titleStyles = {
                fontSize: '30px'
            };
        }

        return (
            <div className={classnames(...classes)}>
                <List>
                    <ListItem
                        style={titleStyles}
                    >
                        <ListItemText
                            primary={this.props.nested ? title : null}
                            secondary={this.props.nested ? subtitle : null}
                        />
                    </ListItem>
                </List>
                {rows}
            </div>
        );
    }
}