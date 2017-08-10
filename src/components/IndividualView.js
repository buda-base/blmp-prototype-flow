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
import RDFClass from '../lib/RDFClass';

// Material-UI
import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import AddCircle from 'material-ui/svg-icons/content/add-circle';
import RemoveCircle from 'material-ui/svg-icons/content/remove-circle';
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
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

        //return properties;
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

    getTopLevelProps(properties: RDFProperty[]) {
        let tree = properties.reduce((obj, cur) => {
            obj[cur.IRI] = cur;
            return obj;
        }, {});
        let topLevelProps = [];
        for (let prop of properties) {
            let isTopLevel = true;
            if (prop.superProperties) {
                for (let superProperty of prop.superProperties) {
                    if (tree[superProperty.IRI]) {
                        isTopLevel = false;
                    }
                }
            }
            if (isTopLevel) {
                topLevelProps.push(prop);
            }
        }
        return topLevelProps;
    }

    propertyGroupRows(propType: string, availableProps: RDFProperty[], setProps: {}, headerStyles: {}, itemStyles: {}): Array<mixed> {
        let rows = [];

        rows.push(<h3>{formatIRI(propType)}</h3>);

        const availablePropsIRIs = availableProps.map(prop => prop.IRI);
        let existingProps = {};
        for (let propKey in setProps) {
            if (availablePropsIRIs.indexOf(propKey) === -1) {
                continue;
            }
            existingProps[propKey] = setProps[propKey];
        }

        for (let availableProp of availableProps) {
            if (!existingProps[availableProp.IRI] && availableProp.ranges.length > 0) {
                existingProps[availableProp.IRI] = [];
            }
        }

        for (let propertyType in existingProps) {
            let propertyValues = existingProps[propertyType];
            rows = rows.concat(this.rowsForProperty(propertyType, propertyValues, headerStyles, itemStyles));
        }


        return rows;
    }


    rowsForProperty(propertyType: string, propertyValues: Array<mixed>, headerStyles: {}, itemStyles: {}): Array<mixed> {
        let rows = [];

        const onTapAdd = (event) => {
            this.addProperty(propertyType);
        };
        rows.push(
            <Subheader
                style={headerStyles}
            >
                {formatIRI(propertyType)}
                {this.props.isEditable &&
                    <span>
                    <IconButton
                        iconStyle={iconSizes.small}
                        onTouchTap={onTapAdd.bind(this)}
                    >
                        <AddCircle color={green800}/>
                    </IconButton>
                    </span>
                }
            </Subheader>
        );


        // let propertyValues = existingProps[propertyType];
        // TODO: need to get all available props as well;

        let row = 0;
        for (let propertyValue of propertyValues) {
            let view;
            let isEditable = this.props.isEditable;
            let key = propertyType + '_';
            let classes = ['individualRow'];
            if (propertyValue instanceof Literal) {
                view = <LiteralView literal={propertyValue}
                                    isEditable={isEditable}
                                    onChange={this.props.onIndividualUpdated}
                />;
                key += propertyValue.value;
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
                />;
                key += propertyValue.id + '_' + row;

            }
            const onTapRemove = (event) => {
                this.removeProperty(propertyType, propertyValue);
            };
            let removeButton = "";
            if (isEditable || this.props.isEditable) {
                removeButton = <IconButton
                    iconStyle={iconSizes.small}
                    onTouchTap={onTapRemove.bind(this)}
                    className="removeButton"
                >
                    <RemoveCircle color={red800}/>
                </IconButton>;
            }

            rows.push(<ListItem
                    innerDivStyle={itemStyles}
                    className={classnames(...classes)}
                    key={key}
                    primaryTogglesNestedList={true}
            >
                {view}{removeButton}
            </ListItem>);

            row++;
        }

        return rows;
    }

    idPropertyRows(headerStyles: {}, itemStyles: {}): {}[] {
        let rows = [];
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
        rows.push(<Subheader style={headerStyles}>ID</Subheader>);
        rows.push(<ListItem innerDivStyle={itemStyles} key={this.props.individual.id + '_id_row'}>{idView}</ListItem>);

        return rows;
    }

    render() {
        let title;
        let subtitle;
        let labels = this.props.individual.getProperty("http://www.w3.org/2000/01/rdf-schema#label");
        if (labels) {
            title = labels[0].value;
        } else if (this.props.individual.id) {
            title = formatIRI(this.props.individual.id);
        } else {
            title = <i>&lt;no id&gt;</i>;
        }
        subtitle = formatIRI(this.props.individual.types[0]);
        if (this.props.individual.types[0]) {
            subtitle = formatIRI(this.props.individual.types[0]);
        } else {
            subtitle = '';
        }
        let rows = [];
        if (this.props.isExpanded || true) {
            let availableProperties = this.getAvailableProperties();

            let dataTypeProps = availableProperties[DATATYPE_PROPERTY.value];
            let objectProps = availableProperties[OBJECT_PROPERTY.value];
            let annotationProps = availableProperties[ANNOTATION_PROPERTY.value];
            let properties = this.props.individual.getProperties();

            let listHeaderStyles = {
                paddingLeft: 0,
                color: '#444'
            };
            if (!this.props.nested) {
                listHeaderStyles = {
                    ...listHeaderStyles,
                    fontSize: '14px',
                    fontWeight: 'bold'
                }
            }
            const listItemStyles = {
                border: 0,
                padding: "0 0 5px 10px",
                display: 'flex',
                alignItems: 'flex-end',
                borderLeft: "1px solid #bbb",
                marginLeft: '5px'
            };

            if (this.props.isEditable) {
                let idRows = this.idPropertyRows(listHeaderStyles, listItemStyles);
                rows = rows.concat(idRows);
                console.log('idRows: %o', idRows);
            }
        if (labels) {
            rows.push(<Subheader style={listHeaderStyles}>Labels</Subheader>);
            rows = rows.concat(labels.map((label, index) => {
                const labelLiteral = new Literal(STRING_TYPE, label.value);
                const labelView = <LiteralView
                    literal={labelLiteral}
                    isEditable={this.props.isEditable}
                />;
                return <ListItem innerDivStyle={listItemStyles} key={this.props.individual.id + '_label_row_'+index}>{labelView}</ListItem>
            }));
        }

            rows = rows.concat(
                this.propertyGroupRows('Datatype Properties', dataTypeProps, properties, listHeaderStyles, listItemStyles),
                this.propertyGroupRows('Object Properties', objectProps, properties, listHeaderStyles, listItemStyles),
                this.propertyGroupRows('Annotation Properties', annotationProps, properties, listHeaderStyles, listItemStyles)
            );
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

        const listItemStyles = {
            border: 0,
            padding: "0 0 5px 0"
        };

        return (

            <div className={classnames(...classes)}>
                <List>
                    <ListItem
                        primaryText={title}
                        secondaryText={subtitle}
                        nestedItems={rows}
                        initiallyOpen={this.props.isExpanded}
                        innerDivStyle={listItemStyles}
                        primaryTogglesNestedList={true}
                        style={titleStyles}
                    />
                </List>
            </div>
        );
    }
}