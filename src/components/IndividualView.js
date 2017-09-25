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

const listHeaderStyle = {
    fontSize: '14px',
    paddingLeft: '0px',
    marginLeft: 0,
    color: '#444',
    fontWeight: 'bold'
};

const getListItemStyle = (level) => {
    return {
        border: 0,
        padding: "0 0 5px 0px",
        display: 'flex',
        alignItems: 'flex-end',
        marginLeft: 30 + 'px'
    };
};

class IndividualProperty extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const greenColor = {
            fill: green[800]
        };
        const redColor = {
            fill: red[800]
        };

        let listItemStyle = getListItemStyle(this.props.level);

        let onTapAdd = null;
        if (this.props.onTapAdd) {
            onTapAdd = this.props.onTapAdd.bind(this);
        }

        // Header
        const propertySubheader = <ListItem>
                {this.props.isEditable() &&
                    <ListItemIcon>
                        <IconButton
                            onTouchTap={onTapAdd}
                            style={{marginRight: 0}}
                        >
                            <AddCircleIcon style={{...greenColor, ...iconSizes.small}}/>
                        </IconButton>
                    </ListItemIcon>
                }
                <ListItemText title={this.props.tooltip} primary={this.props.title} disableTypography style={listHeaderStyle} />

            </ListItem>;

        // Values
        let valueRows = [];
        for (let propertyValue of this.props.propertyValues) {
            let view;
            let isEditable = this.props.isEditable(propertyValue);
            let classes = ['individualRow'];
            let key = this.props.property.IRI + '_';
            if (propertyValue instanceof Literal) {
                view = <LiteralView literal={propertyValue}
                                    isEditable={isEditable}
                                    onChange={this.props.onLiteralChanged}
                />;
                key += propertyValue.uniqueId;
                if (isEditable) {
                    classes.push('individualLiteralRowEditable');
                } else {
                    classes.push('individualLiteralRow');
                }
            } else if (propertyValue instanceof Individual) {
                view = <IndividualView individual={propertyValue}
                                       isExpanded={false}
                                       isEditable={false}
                                       ontology={this.props.ontology}
                                       nested={true}
                                       onIndividualUpdated={this.props.onIndividualUpdated}
                                       level={this.props.level + 1}
                />;
                key += propertyValue.id + '_' + propertyValue.uniqueId;

            }

            const onTapRemove = (event) => {
                console.log('clicked IndividualProperty onTapRemove propertyType: %o, propertyValue: %o', this.props.property.IRI, propertyValue);
                this.props.removeProperty(this.props.property.IRI, propertyValue);
            };
            let removeButton = "";
            if (isEditable) {
                removeButton = <IconButton
                    onTouchTap={onTapRemove}
                    className="removeButton"
                >
                    <RemoveCircleIcon style={{...redColor, ...iconSizes.small}}/>
                </IconButton>;
            }

            valueRows.push(<ListItem
                style={listItemStyle}
            >
                {view}
                <ListItemSecondaryAction>{removeButton}</ListItemSecondaryAction>
            </ListItem>);
        }

        return <List>
            {propertySubheader}
            {valueRows}
        </List>;
    }
}

export default class IndividualView extends React.Component {
    _editableIndividuals = [];

    constructor(props) {
        super(props);

        this.state = {
            popoversOpen: {},
            popoversEl: {},
            collapseState: {},
            isExpanded: props.isExpanded
        }
    }

    setCollapseState(id: string, open: boolean) {
        const collapseState = {
            ...this.state.collapseState,
            [id]: open
        };
        this.setState((prevState, props) => {
            return {
                ...prevState,
                collapseState
            }
        })
    }

    toggleCollapseState(id: string) {
        let open;
        if (this.state.collapseState[id] === undefined) {
            open = true;
        } else {
            open = !this.state.collapseState[id];
        }

        this.setCollapseState(id, open);
    }

    toggleExpandedState() {
        this.setState((prevState, props) => {
            return {
                ...prevState,
                isExpanded: !prevState.isExpanded
            }
        })
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

    propertyGroupRows(availableProps: RDFProperty[], setProps: {}, removeUnsetProps:boolean=false): Array<mixed> {
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

        let propertyLists = [];
        for (let propertyType in existingProps) {
            let propertyValues = existingProps[propertyType];
            propertyLists.push(this.listForProperty(props[propertyType], propertyValues));
        }
        return propertyLists;
    }

    listForProperty(property: RDFProperty, propertyValues: Array<mixed>): {} {
        const onTapAdd = (event) => {
            this.addProperty(property.IRI);
        };
        const onLiteralChanged = (event) => {
            this.props.onIndividualUpdated();
        };
        let tooltip = property.comments.map(comment => comment.comment).join('\n\n');
        let title = (property.label) ? capitalize(property.label) : formatIRI(property.IRI);

        const isEditable = (propertyValue) => {
            let isEditable = this.props.isEditable;
            if (propertyValue && propertyValue instanceof Individual) {
                isEditable = (this._editableIndividuals.indexOf(propertyValue) !== -1) ? true : false;
            }
            return isEditable;
        };

        const propertyView = <IndividualProperty
            onTapAdd={onTapAdd}
            onIndividualUpdated={this.props.onIndividualUpdated}
            onLiteralChanged={onLiteralChanged}
            tooltip={tooltip}
            title={title}
            property={property}
            propertyValues={propertyValues}
            isEditable={isEditable}
            ontology={this.props.ontology}
            level={this.props.level}
        />;

        return propertyView;
    }

    getPropertyLists(): React.Element<*>[] {
        let removeUnsetProperties = true;
        if (this.props.isEditable) {
            removeUnsetProperties = false;
        }

        let availableProperties = this.getAvailableProperties();
        let dataTypeProps = availableProperties[DATATYPE_PROPERTY.value];
        let objectProps = availableProperties[OBJECT_PROPERTY.value];
        let annotationProps = availableProperties[ANNOTATION_PROPERTY.value];
        let properties = this.props.individual.getProperties();

        const datatypeHeading = (!this.props.nested) ? 'Datatype Properties' : '';
        const datatypeRows = this.propertyGroupRows(dataTypeProps, properties, removeUnsetProperties);

        const objectHeading = (!this.props.nested) ? 'Object Properties' : '';
        const objectRows = this.propertyGroupRows(objectProps, properties, removeUnsetProperties);

        const annotationHeading = (!this.props.nested) ? 'Annotation Properties' : '';
        const annotationRows = this.propertyGroupRows(annotationProps, properties,  removeUnsetProperties);

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
            padding: '10px 0 10px 0',
            margin: '0'
        };

        const dataRowStyle = {
            marginLeft: ((this.props.level + 1) * 20) + 'px'
        };

        let lists = [];
        for (let [index, propertyData] of propertyTypes.entries()) {
            let collapseId = [this.props.individual.id, 'level', this.props.level, index, 'collapsed'].join('_');

            let handleCollapse = () => {
                this.toggleCollapseState(collapseId);
            };

            if (this.props.nested) {
                lists.push(
                    <List>
                        {propertyData.rows}
                    </List>
                )
            } else {
                lists.push(
                    <List>
                        <ListItem button onClick={handleCollapse}>
                            <ListItemText
                                disableTypography
                                primary={propertyData.heading}
                                style={headingStyles}
                            />
                            {this.state.collapseState[collapseId] ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                        <Collapse in={this.state.collapseState[collapseId]} style={dataRowStyle} >
                            {propertyData.rows}
                        </Collapse>
                    </List>
                );
            }
        }

        return lists;
    }

    getIdList(): React.Element<*> {
        const idProperty = new RDFProperty('ID');
        const idLiteral = new Literal(STRING_TYPE, this.props.individual.id);
        const propertyValues = [idLiteral];

        const onChange = (value) => {
            this.props.individual.id = value;
            this.forceUpdate();
            this.props.onIndividualUpdated();
        };

        return <IndividualProperty
            onIndividualUpdated={this.props.onIndividualUpdated}
            onLiteralChanged={onChange}
            title={'ID'}
            property={idProperty}
            propertyValues={propertyValues}
            isEditable={() => true}
            ontology={this.props.ontology}
            level={this.props.level}
        />;
    }

    getLabelsList(): React.Element<*> | null {
        let labels = this.props.individual.getProperty("http://www.w3.org/2000/01/rdf-schema#label");

        if (!labels) return null;

        const labelProperty = new RDFProperty('http://www.w3.org/2000/01/rdf-schema#label');
        const onLiteralChanged = (event) => {
            this.props.onIndividualUpdated();
        };

        return (
            <List>
                <IndividualProperty
                    onIndividualUpdated={this.props.onIndividualUpdated}
                    onLiteralChanged={onLiteralChanged}
                    title={'Label'}
                    property={labelProperty}
                    propertyValues={labels}
                    isEditable={this.props.isEditable}
                    ontology={this.props.ontology}
                    level={this.props.level}
                />;
            </List>
        )
    }

    getNestedTitleList(): React.Element<*> | null {
        if (!this.props.nested) return null;

        let title = '';
        let subtitle = '';
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
        }

        return(
            <List>
                <ListItem button onClick={() => this.toggleExpandedState()}>
                    <ListItemText
                        primary={title}
                        secondary={subtitle}
                    />
                    {this.state.isExpanded ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
            </List>
        )
    }

    render() {
        // ID
        let idList = null;
        if (!this.props.nested) {
            idList = this.getIdList();
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
                {this.getNestedTitleList()}
                <Collapse in={this.state.isExpanded}>
                    {idList}
                    {this.getLabelsList()}
                    {this.getPropertyLists()}
                </Collapse>
            </div>
        );
    }
}
