// @flow
import React from 'react';
import './IndividualView.css';
import Literal, { STRING_TYPE } from '../lib/Literal';
import Individual from '../lib/Individual';
import LiteralView from './LiteralView';
import formatIRI from '../lib/formatIRI';
import classnames from 'classnames';

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
import { DATATYPE_PROPERTY, OBJECT_PROPERTY, ANNOTATION_PROPERTY } from '../lib/Ontology';

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

    removeProperty(propertyType: string, value: any) {
        this.props.individual.removeProperty(propertyType, value);
        this.forceUpdate();
    }

    getAvailableProperties() {
        const ontology = this.props.ontology;
        const individual = this.props.individual;
        const type = individual.types[0];
        const properties = ontology.getClassProperties(type);

        return properties;
    }

    getGroupedProperties(properties: {}) {
        let dataTypeProps = properties.filter(prop => prop.propertyType === DATATYPE_PROPERTY.value);
        let objectTypeProps = properties.filter(prop => prop.propertyType === OBJECT_PROPERTY.value);
        let annotationTypeProps = properties.filter(prop => prop.propertyType === ANNOTATION_PROPERTY.value);
        const groupedProps = {
            [DATATYPE_PROPERTY.value]: this.getTopLevelProps(dataTypeProps),
            [OBJECT_PROPERTY.value]: this.getTopLevelProps(objectTypeProps),
            [ANNOTATION_PROPERTY.value]: this.getTopLevelProps(annotationTypeProps)
        };

        return groupedProps;
    }

    getTopLevelProps(properties: {}[]) {
        let tree = properties.reduce((obj, cur) => {
            obj[cur.name] = cur;
            return obj;
        }, {});
        console.log('tree: %o', tree);
        let topLevelProps = [];
        for (let prop of properties) {
            if (!tree[prop.parent]) {
                topLevelProps.push(prop);
            }
        }
        return topLevelProps;
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
                const onChange = (value) => {
                    this.props.individual.id = value;
                    this.forceUpdate();
                };
                const idLiteral = new Literal(STRING_TYPE, this.props.individual.id);
                const idView = <LiteralView
                    literal={idLiteral}
                    isEditable={this.props.isEditable}
                    onChange={onChange.bind(this)}
                />;
                rows.push(<Subheader style={listHeaderStyles}>ID</Subheader>);
                rows.push(<ListItem innerDivStyle={listItemStyles} key={this.props.individual.id + '_id_row'}>{idView}</ListItem>);
            }

            for (let propertyType in properties) {
                const onTapAdd = (event) => {
                    const el = event.currentTarget;
                    this.setState((prevState, props) => {
                        return {
                            ...prevState,
                            popoversOpen: {
                                ...prevState.popoversOpen,
                                [propertyType]: true
                            },
                            popoversEl: {
                                ...prevState.popoversEl,
                                [propertyType]: el
                            }
                        }
                    });
                };
                const popoverClosed = (event) => {
                    this.setState((prevState, props) => {
                        return {
                            ...prevState,
                            popoversOpen: {
                                ...prevState.popoversOpen,
                                [propertyType]: false
                            }
                        }
                    });
                };
                rows.push(<Subheader
                    style={listHeaderStyles}
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
                        <Popover
                            open={this.state.popoversOpen[propertyType]}
                            anchorEl={this.state.popoversEl[propertyType]}
                            onRequestClose={popoverClosed}
                        >
                            <Menu>
                                <MenuItem
                                    primaryText="Create New..."
                                    onTouchTap={(e) => {
                                        this.addProperty(propertyType);
                                        popoverClosed(e);
                                    }}
                                />
                                <MenuItem
                                    primaryText="Select"
                                    rightIcon={<ArrowDropRight/>}
                                    menuItems={[
                                        <MenuItem
                                            primaryText="Existing Place 1"
                                            onTouchTap={popoverClosed}
                                        />,
                                        <MenuItem
                                            primaryText="Existing Place 2"
                                            onTouchTap={popoverClosed}
                                        />
                                    ]}
                                />
                            </Menu>
                        </Popover>
                        </span>
                    }
                </Subheader>);

                let propertyValues = properties[propertyType];
                let row = 0;
                for (let propertyValue of propertyValues) {
                    let view;
                    let isEditable = this.props.isEditable;
                    let key = propertyType + '_';
                    let classes = ['individualRow'];
                    if (propertyValue instanceof Literal) {
                        view = <LiteralView literal={propertyValue}
                                            isEditable={isEditable}
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
                            innerDivStyle={listItemStyles}
                            className={classnames(...classes)}
                            key={key}
                            primaryTogglesNestedList={true}
                    >
                        {view}{removeButton}
                    </ListItem>);

                    row++;
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
        let cardStyles = {};
        let titleStyles = {};
        let headerStyles = {};
        if (this.props.nested) {
            cardStyles = {
                padding: 0
            };
            headerStyles = {
                padding: '7px'
            };
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