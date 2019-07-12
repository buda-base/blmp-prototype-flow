// @flow
import * as React from 'react';
import './IndividualView.css';
import Literal, { STRING_TYPE } from '../lib/Literal';
import Individual from '../lib/Individual';
import LiteralView from './LiteralView';
import Ontology from 'lib/Ontology';
import formatIRI from '../lib/formatIRI';
import classnames from 'classnames';
import { DATATYPE_PROPERTY, OBJECT_PROPERTY, ANNOTATION_PROPERTY } from '../lib/Ontology';
import RDFProperty from '../lib/RDFProperty';
// import type { RDFComment } from '../lib/RDFProperty';
import capitalize from '../lib/capitalize';
import { REMOTE_ENTITIES } from '../api/api';
import store from "../index.js";
import * as ui from 'state/ui/actions';

// redux
// import * as uiActions from 'state/ui/actions';

// rdf components
import RDFComponents from './RDF/rdf_components';

// Material-UI
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import IconButton from '@material-ui/core/IconButton';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import {red, green} from '@material-ui/core/colors';
import AddBoxIcon from '@material-ui/icons/AddBox';
import Popover from '@material-ui/core/Popover';
// import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';


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
      alignItems: 'center', //'flex-start',
      marginLeft: 15 + 'px',
      //width:"calc(100% - 30px)"
      //              paddingRight:"50px"
   };
};


const typeIRI = 'http://purl.bdrc.io/ontology/core/Type';
const facetIRI = 'http://purl.bdrc.io/ontology/core/Facet';


type IndividualPropertyProps = {
   isEditable: (propertyValue: ?any) => boolean,
   onIndividualUpdated?: () => void,
   onLiteralChanged: (value: string, language: string) => void,
   onSelectedResource: (IRI: string) => void,
   onTapAdd?: (individual: Individual, property: RDFProperty, value?:string) => void,
   onAddResource?: (individual: Individual, property: RDFProperty) => void,
   individual: Individual,
   level: number,
   ontology: Ontology,
   property: RDFProperty,
   propertyValues: any[],
   propertyType: any,
   title: string,
   tooltip: string,
   showLabel: boolean,
   nested: boolean,
   assocResources:{[string]:{}}
}

type CollapState = {
   collapseState: {},
   isExpanded: boolean,
}

class IndividualProperty extends React.Component<IndividualPropertyProps,CollapState> {
   _list : [] ;

   /*
   componentWillMount()
   {
   console.log("will mount indiProp",this.props.individual.id)
}
componentDidMount()
{
console.log("did mount indiProp",this.props.individual.id)
}

componentWillUpdate()
{
console.log("will update indiProp",this.props.individual.id)
}
componentDidUpdate()
{
console.log("did update indiProp",this.props.individual.id)
}
*/

constructor(props: Props) {
   super(props);

   // console.log("constructor",this.props.individual.IRI)

   this.state = {
      collapseState: {},
      isExpanded: props.isExpanded,
      open: false,
   }

   let onto = this.props.ontology ;

   for(let i in this.props.property.ranges)
   {
      let t = this.props.property.ranges[i]

      if(onto._classes[t] && onto._classes[t].hasAncestorclass(typeIRI))
      {
         this._list = onto._classes[t]._values.map((val) =>
         {

            return ( <MenuItem onClick={(ev) => this.handleMenu(ev,val)}>{onto.getMainLabel(val)}</MenuItem> )
         })
      }
      else if(onto._classes[t] && onto._classes[t].hasAncestorclass(facetIRI))
      {
         //console.log("sub",this.props.propertyValues)

         let found = false ;

         for(let k in this.props.propertyValues) {  //.ranges[i]

             //console.log("k",k)

            let v =  this.props.propertyValues[k]
            if(!v || v._types.length === 0) continue ;
            for(i in v._types) {
               let u = v._types[i]

               //console.log("u",u,onto._classes[u],onto._classes[u].hasAncestorclass(facetIRI,false))

               if(onto._classes[u] && onto._classes[u].hasAncestorclass(facetIRI,false))
               {
                     //console.log("sup/facet",t,onto._classes[t].subclasses) //,onto._classes[t].subclasses)

                     this._list = onto._classes[t]._subclasses.map((val) =>
                     {
                        //console.log("val",val)
                        return ( <MenuItem onClick={(ev) => this.handleMenu(ev,val.IRI)}>{onto.getMainLabel(val.IRI)}</MenuItem> )
                     })

                     found = true
                     // console.log("list",this._list)
                     break ;
                  //
               }
            }

            if(found) break ;
         }
      }
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

handleClick = (event) => {
   // This prevents ghost click.
   event.preventDefault();

   this.setState({
      open: true,
      anchorEl: event.currentTarget,
   });
};

handleRequestClose = () => {
   this.setState({
      open: false,
   });
};

handleMenu = (event, value : string = "") => {
   // This prevents ghost click.
   event.preventDefault();

   // this.props.individual.id = value ;

   // this.props.onChange()

   console.log("value",value,this.props,this._individual,this.props.individual);

   this.props.onTapAdd(this.props.individual, this.props.property,value)

   // this.addProperty(this.props.property.IRI);

   this.setState({
      open: false,
   })
};

isExpandable() {
   return this.props.isExpandable
}


render() {

   // COMM
    console.groupCollapsed("indiProp.render",this.props.title)
   //console.log(this.props)

   const greenColor = {
      fill: green[800]
   };
   const redColor = {
      fill: red[800]
   };

   let listItemStyle = getListItemStyle(this.props.level);

   let onTapAdd = null;
   if (this.props.onTapAdd) {

      let propsOnTapAdd = this.props.onTapAdd;

      onTapAdd = () => {

         //                 console.log("tapAdd!")
         propsOnTapAdd(this.props.individual, this.props.property);
      }


   }


   // Header
   const iconStyle = {marginRight: 0} ;
   const circleStyle = {...greenColor, ...iconSizes.small} ;
   const popStyle = {horizontal: 'left', vertical: 'bottom'} ;
   const listStyle = {padding:"0 16px 0 0",margin:"0px 0px 5px 0px"}
   //,boxShadow: "0px 5px 5px -4px rgba(0,0,0,0.2)"}

   console.log("property",this.props)

   const propertySubheader = [<ListItem style={listStyle} >
   {this.props.isEditable() &&  //!this.props.nested && this.props.level < 1 &&
      <ListItemIcon>
      <IconButton
         onClick={this._list ? this.handleClick : onTapAdd}
         style={iconStyle}
         title={ "add a new "
            //+ (this.props.property&&this.props.property.ranges?this.props.property.ranges.map(e => this.props.ontology.getMainLabel(e)):"")
            + (this.props.propertyType?this.props.ontology.getMainLabel(this.props.propertyType):"")}
         {...(this.props.title === 'ID'?{disabled:true,title:"only one allowed"}:{})}
      >
         <AddCircleIcon style={circleStyle}/>
      </IconButton>
      </ListItemIcon>
   }
   <ListItemText title={this.props.tooltip} primary={this.props.title} disableTypography style={listHeaderStyle} />

</ListItem>,
   <Popover
      open={this.state.open}
      anchorEl={this.state.anchorEl}
      anchorOrigin={popStyle}
      //targetOrigin={{horizontal: 'left', vertical: 'top'}}
      onClose={this.handleRequestClose}
   >
      <List>{this._list}</List>
   </Popover>];

   // Values

   let valueRows = [];
   let view = null;
   for (let propertyValue of this.props.propertyValues) {
      let sty = ""
      let titleView = undefined;
      let isEditable = !this.props.nested || this.props.isEditable(propertyValue);
      let classes = ['individualRow'];
      let key = this.props.property.IRI + '_';
      if (propertyValue instanceof Literal) {
         view = <LiteralView literal={propertyValue}
         isEditable={isEditable}
         onChange={this.props.onLiteralChanged}
         />;
         key += propertyValue.uniqueId
         if (isEditable) {
            classes.push('individualLiteralRowEditable');
         } else {
            classes.push('individualLiteralRow');
         }

         sty = "lit" ;

         //                 console.log("view1",view)


      } else if (propertyValue instanceof Individual ) {

         sty = "ind" ;
   
         console.log("propV", propertyValue)

         const onClick = () => {
            if (!propertyValue.hasGeneratedId && this.props.onSelectedResource
               && propertyValue.id.match(/[/](([WPCRTLOG]|UT)[A-Z_0-9]+)+$/)
            ) {

               // here is where to check whether resource is viewable on central panel
               //                         console.log("propVal",propertyValue.id,propertyValue)
               this.props.onSelectedResource(propertyValue.id);
            }
         }


      // console.log("ranges",this.props.property.ranges)
      let classN = undefined

      for (let range of this.props.property.ranges) {
         if (range in RDFComponents) {
            const rdfComponent = RDFComponents[range];
            classN = "RDFCompo";
            titleView = React.createElement(rdfComponent, {
               onSelectedResource: this.props.onSelectedResource,
               onClick: onClick,
               individual: propertyValue,
               isEditable: this.props.isEditable(propertyValue), //isEditable,
               isExpandable: true,
               isExpanded: false,
               level: this.props.level + 1,
               nested: true,
               ontology: this.props.ontology,
               property: this.props.property,
               onChange:this.props.onLiteralChanged
            }, null);
            //                         console.log("propView",titleView);

            break;
         }
      }


      //console.log("ref",propertyValue._uniqueId)
      view = <IndividualView
               assocResources={this.props.assocResources}
               onSelectedResource={this.props.onSelectedResource}
               onIndividualUpdated={this.props.onIndividualUpdated}
               onClick={onClick}
               individual={propertyValue}
               isEditable={isEditable}
               isExpandable={true}
               isExpanded={false}
               level={this.props.level + 1}
               nested={true}
               ontology={this.props.ontology}
               titleView={titleView}
               className={classN}
               showLabel={true}
               propertyType={this.props.propertyType}
               onTapAdd={onTapAdd}
               onAddResource={this.props.onAddResource}
            />;



      //                 console.log("view2",view)


      key += propertyValue.id + '_' + propertyValue.uniqueId;
   }

   const onTapRemove = (event) => {
      this.props.individual.removeProperty(this.props.property.IRI, propertyValue);
      if (this.props.onIndividualUpdated) {
         this.props.onIndividualUpdated();
      }
   };
   let removeButton = "";

   let txtRemo = "remove "
   if(!propertyValue._id) txtRemo += propertyValue._value
   else if(!propertyValue._hasGeneratedId) txtRemo += this.props.ontology.getMainLabel(propertyValue._id)
   else txtRemo += this.props.ontology.getMainLabel(propertyValue._types[0])
   txtRemo += " from " + this.props.ontology.getMainLabel(this.props.property.IRI)
   //txtRemo += "\n"+JSON.stringify(propertyValue,null,3)

   if (isEditable && this.props.title !== "ID") {
      const style = {...redColor, ...iconSizes.small} ;
      removeButton =
         <IconButton
            onClick={onTapRemove}
            className="removeButton"
            title={txtRemo} >
            <RemoveCircleIcon style={style}/>
         </IconButton>;
   }


   //console.log("view",view)

   valueRows.push(
      <ListItem
         className={"youpi"}
         key={key}
         style={listItemStyle} >
         {view}
         <ListItemSecondaryAction
            className={"remoBut "+sty}
            >{removeButton}</ListItemSecondaryAction>
      </ListItem>);

      //              this.props.isExpanded &&
   }

   console.groupEnd();

   if(this.props.propertyType === "http://purl.bdrc.io/ontology/admin/logEntry"  // when too much element to view at once (LogEntry, teacherOf, etc.)
   || this.props.propertyValues.length > 10)
   {
      let collapseId = [this.props.individual.id, 'level', this.props.level, 0, 'collapsed'].join('_');

      let handleCollapse = () => {
         this.toggleCollapseState(collapseId);
      };

      const headingStyles = {
         fontSize: '12px',
         fontWeight: 'normal',
         padding: '0px 0px 0px 15px',
         margin: '0',
         textTransform:"uppercase"
      };

      const dataRowStyle = {
         marginLeft: ((this.props.level + 1) * 20) + 'px'
      };

      let inline = (valueRows.length === 1) ;

      //console.log('rows',valueRows)

      return (
         <List  className={(this.props.level === 0 ?"encaps":"")+ (inline?" ListFlex":"")+" DontFlex"} >
            <div className={inline?"ListItemInline":""}>{propertySubheader}</div>
            <ListItem button onClick={handleCollapse}>
               <ListItemText
                  disableTypography
                  primary={(this.state.collapseState[collapseId] ? "hide":"show")+" ("+this.props.propertyValues.length+")"}
                  style={ headingStyles }
               />
                  {this.state.collapseState[collapseId] ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse
                  className={"inCollapse " + this.state.collapseState[collapseId] }
                  in={this.state.collapseState[collapseId]}
                  style={dataRowStyle}
            >
               {valueRows}
            </Collapse>
         </List>);
      }
      else
      {
         let inline = (valueRows.length === 1) ;

         //console.log('rows',valueRows,view)
         //if(Object.keys(this.refs).length > 0)console.log("refs!",this.refs)
         //if(this.refs["indiView"]) console.log(this.refs["indiView"].props.individual._uniqueId)

         return (<List className={(this.props.level === 0 ?"encaps":"")+ (inline?" ListFlex":"")}>
            <div className={(inline?"ListItemInline":"") /*+(valueRows.length === 1 && view.isCollapse ? " w100sibling":"")*/}>{propertySubheader}</div>
               {valueRows}
            </List>);
         }
      }
   }

type Props = {
   onSelectedResource: (id: string) => void,
   onIndividualUpdated?: () => void,
   onTapAdd?: (individual: Individual, property: RDFProperty) => void,
   onAddResource?: (individual: Individual, property: RDFProperty) => void,
   onClick?: () => void,
   assocResources:{[string]:{}},
   individual: Individual,
   isEditable: boolean,
   isExpandable?: boolean,
   isExpanded: boolean,
   level: number,
   nested: boolean,
   ontology: Ontology,
   titleView?: React.Element<*>,
   propertyType: any,
}

type State = {
   collapseState: {},
   isExpanded: boolean
}

export default class IndividualView extends React.Component<Props, State> {
   _editableIndividuals = [];
   _allowExpansion = false ;
   _propList = null ;
   _labList = null ;
   _idList = null ;

   constructor(props: Props) {
      super(props);

      this.state = {
         collapseState: {},
         isExpanded: props.isExpanded,
         open: false,
      }

      this.isCollapse.bind(this)

   }

/*
   componentWillMount()
   {
      console.log("will mount indiView",this.props.individual.id)
   }
   componentDidMount()
   {
      console.log("did mount indiView",this.props.individual.id)
   }

   componentWillUpdate()
   {
      console.log("will update indiView",this.props.individual.id)
   }

   componentDidUpdate()
   {
      console.log("did update indiView",this.props.individual.id)
   }
*/

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

   addProperty(propertyType: string, propy:RDFProperty, val:string = "") {
      const ontology = this.props.ontology;
      const individual = this.props.individual;
      const type = individual.types[0];
      const properties = ontology._properties //getClassProperties(type);

      let property = properties[propertyType] //properties.find((prop: RDFProperty) => prop.IRI === propertyType);
      if(propy) property = propy


      //
      console.log("add",this.props.individual,propertyType,property,type,val);

      if(property.IRI === "http://www.w3.org/2000/01/rdf-schema#label")
      {
         const literal = new Literal("http://www.w3.org/1999/02/22-rdf-syntax-ns#langString", '');
         individual.addProperty(propertyType, literal);
      }
      else
      {
         if (!property || property.ranges.length === 0 ) {
            return;
         }

         const propertyRange = property.ranges[0];

         console.log("range",propertyRange)

         if (ontology.isClass(propertyRange)) {
            const propertyIndividual = new Individual();


            if(val && val !== "") {
               let v = ontology._classes[propertyRange] ;
               if(v && !v.hasSuperclass(typeIRI)) { propertyIndividual.addType(val); }
               else { propertyIndividual.id = val ; }
               propertyIndividual.addDefaultProperties(ontology._classes[val])
            }
            else {
               propertyIndividual.addType(propertyRange);
               propertyIndividual.addDefaultProperties(ontology._classes[propertyRange])
            }
            this._editableIndividuals.push(propertyIndividual);
            individual.addProperty(propertyType, propertyIndividual);


            if(property.ranges.indexOf('http://purl.bdrc.io/ontology/core/PersonName') !== -1
               || property.ranges.indexOf('http://purl.bdrc.io/ontology/core/WorkTitle') !== -1)
            {
               propertyIndividual.addProperty("http://www.w3.org/2000/01/rdf-schema#label",new Literal("http://www.w3.org/1999/02/22-rdf-syntax-ns#langString","","en"))
            }

         } else {
            const ranges = ontology.getPropertyRanges(propertyType);
            const literal = new Literal(ranges[0], '');
            individual.addProperty(propertyType, literal);
         }
      }


      this.forceUpdate();
      if (this.props.onIndividualUpdated) {
         this.props.onIndividualUpdated();
      }

   }

   removeProperty(propertyType: string, value: any) {
      this.props.individual.removeProperty(propertyType, value);
      this.forceUpdate();
      if (this.props.onIndividualUpdated) {
         this.props.onIndividualUpdated();
      }
   }

   getAvailableProperties(): {} {
      const ontology = this.props.ontology;
      // const individual = this.props.individual;
      // const type = individual.types[0];

      /*
      console.log("ontology",ontology);

      console.log("type",type);

      const properties = ontology.getClassProperties(type);

      console.log("availableProperties",properties);

      const groupedProps = this.getGroupedProperties(properties);

      console.log("grouProps",groupedProps);

      const groupedProps = {
      [DATATYPE_PROPERTY.value]: ontology.getPropertiesArray(DATATYPE_PROPERTY),
      [OBJECT_PROPERTY.value]: ontology.getPropertiesArray(OBJECT_PROPERTY),
      [ANNOTATION_PROPERTY.value]: ontology.getPropertiesArray(ANNOTATION_PROPERTY)
   };
   */

   //         console.log("grouProps",groupedProps);



   return ontology._propertiesArray ;
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


      //         console.log("availProp",availableProps)

      // let rows = [];
      let props = {};
      const availablePropsIRIs = availableProps.map(prop => {
         props[prop.IRI] = prop;
         return prop.IRI;
      });

      //         console.log("availPropIRI",availablePropsIRIs)

      console.log("propertyList",setProps)

      let existingProps = {};
      for (let propKey in setProps) {

         if(availablePropsIRIs.indexOf(propKey) === -1)
         {
            //if (propKey != "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
            //&& propKey != "http://purl.bdrc.io/ontology/admin/status"  )
            // {
               //                   console.log("skipping",propKey)
               continue;

            // }
         }

         existingProps[propKey] = setProps[propKey];

      }

      console.log("existProps",existingProps)

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
         propertyLists.push(this.listForProperty(props[propertyType], propertyValues, propertyType));
      }


      //       console.log("return",propertyLists)
      //        console.groupEnd()


      return propertyLists;
   }

   listForProperty(property: RDFProperty, propertyValues: Array<mixed>, propertyType:mixed): {} {

      //         console.log("RDFprop",property);
      //         console.log("propValues",propertyValues);
      //         console.log("propType",propertyType);

      const onLiteralChanged = (event) => {
         //console.log("literalchanged2")
         if (this.props.onIndividualUpdated) {
            this.props.onIndividualUpdated();
         }
      };

      //         console.log("property.comments",property.comments);

      let tooltip = property.comments.map(comment => comment.comment).join('\n\n');
      let title = ((property.label) ? capitalize(property.label) : formatIRI(property.IRI));
      const propIsEditable = this.props.isEditable;
      const isEditable = (propertyValue) => {
         let isEditable = propIsEditable;
         /*
         if (propertyValue && propertyValue instanceof Individual) {
         if (this._editableIndividuals.indexOf(propertyValue) !== -1) {
            isEditable = true;
         } else {
            isEditable = false;
         }
         }
         */
         return isEditable;
      };

      let onTapAdd = (id,prop,val) => {
         this.addProperty(property.IRI,null,val);
      }

      //         console.log("tapAdd1",onTapAdd)

      for (let range of property.ranges) {
         if (REMOTE_ENTITIES.indexOf(range) !== -1)
         {
            let addResource = (a:Individual,b:RDFProperty) =>
            {
               // console.log("addR!!!",a,b)
               this.props.onAddResource(a,b);
               this.forceUpdate();
               if (this.props.onIndividualUpdated) {
                  this.props.onIndividualUpdated();
               }
            }

            onTapAdd = addResource;
            break;
         }
      }

      //         console.log("tapAdd2",property.IRI,property,onTapAdd)

      const propertyView = <IndividualProperty
         nested={this.props.nested}
         isEditable={isEditable}
         onIndividualUpdated={this.props.onIndividualUpdated}
         onLiteralChanged={onLiteralChanged}
         onSelectedResource={this.props.onSelectedResource}
         onTapAdd={onTapAdd}
         onAddResource={this.props.onAddResource}
         individual={this.props.individual}
         level={this.props.level}
         ontology={this.props.ontology}
         property={property}
         propertyValues={propertyValues}
         propertyType={propertyType}
         title={title}
         tooltip={tooltip}
         assocResources={this.props.assocResources}
         {...this.props.individual.id.match(/([_A-Z]+[0-9]+)+$/) ? { showLabel : true }:{} }
      />;

      //         console.log("propView",propertyView.props.title,propertyView)

      return propertyView ;
   }

   handleClick = (event) => {

      // This prevents ghost click.
      event.preventDefault();

      this.setState({
         open: true,
         anchorEl: event.currentTarget,
      });
   };

   handleRequestClose = () => {
      this.setState({
         open: false,
      });
   };

   handleMenu = (event, value : string = "") => {
      // This prevents ghost click.
      event.preventDefault();

   }


   getPropertyLists(): (?React.Element<*>)[] {
      let removeUnsetProperties = true;
      if (this.props.isEditable) {
         removeUnsetProperties = true; //false;
      }



      let availableProperties = this.getAvailableProperties();
      let dataTypeProps = availableProperties[DATATYPE_PROPERTY.value];
      let objectProps = availableProperties[OBJECT_PROPERTY.value];
      let annotationProps = availableProperties[ANNOTATION_PROPERTY.value];
      let properties = this.props.individual.getProperties();

      const objectHeading = '' //(!this.props.nested) ? 'Object Properties' : '';
      let objectRows = this.propertyGroupRows(objectProps, properties, removeUnsetProperties);

      const datatypeHeading = '' // (!this.props.nested) ? 'Datatype Properties' : '';
      const datatypeRows = this.propertyGroupRows(dataTypeProps, properties, removeUnsetProperties);

      const annotationHeading = (!this.props.nested) ? 'Annotation Properties' : '';
      let annotationRows = this.propertyGroupRows(annotationProps, properties,  removeUnsetProperties);


      for(let a in annotationRows)
      {
         //             console.log("a",annotationRows[a]);
         if(annotationRows[a].props.propertyType === "http://www.w3.org/2004/02/skos/core#prefLabel")
         {
            objectRows.unshift(annotationRows[a])
            delete annotationRows[a]
         }
      }



      const propertyTypes = [

         {
            heading: objectHeading,
            rows: objectRows
         },
         {
            heading: datatypeHeading,
            rows: datatypeRows
         },
         {
            heading: annotationHeading,
            rows: annotationRows
         }
      ];

      // const headingStyles = {
      //    fontSize: '21px',
      //    fontWeight: 'bold',
      //    padding: '10px 0 10px 0',
      //    margin: '0'
      // };

      // const dataRowStyle = {
      //    marginLeft: ((this.props.level + 1) * 20) + 'px'
      // };

      let lists: (?React.Element<*>)[] = [];
      let newprops: (?React.Element<*>)[] = [];
      for (let [index, propertyData] of propertyTypes.entries()) {
         let collapseId = [this.props.individual.id, 'level', this.props.level, index, 'collapsed'].join('_');

         // let handleCollapse = () => {
         //    this.toggleCollapseState(collapseId);
         // };

         //if (this.props.nested) {

         for(let i in propertyData.rows) {
            let r = propertyData.rows[i]
            // console.log("r",r)
            if(!r.props.propertyValues || r.props.propertyValues.length === 0) {
               newprops.push(propertyData.rows[i])
               delete propertyData.rows[i]
            }
         }

         if(propertyData.rows.length > 0) lists.push(
            <List key={collapseId}>{propertyData.rows}</List>
         )

         /* // no need anymore
      }
      else
      {

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
   }*/

      }


      if(newprops.length > 0) {
          const tree= this.props.individual._propTree
         //console.log("tree",this.props.individual.id,tree)

         const greenColor = {
            fill: green[800]
         };
         const iconStyle = {marginRight: 0} ;
         const circleStyle = {...greenColor, ...iconSizes.small} ;
         const popStyle = {horizontal: 'left', vertical: 'bottom'} ;

         let poplist = {}

         for(let p of newprops)
         {
           //console.log("newp",p.props.propertyType,tree[p.props.propertyType])

            if(!poplist[tree[p.props.propertyType]]) poplist = {...poplist, [tree[p.props.propertyType]]:[] }

            poplist[tree[p.props.propertyType]].push(
               <MenuItem key={p.props.title} onClick={(e) =>
                  {
                     // console.log("click!!",this.props,p.props);
                     p.props.onTapAdd(this.props.individual,p.props.property);
                     this.handleRequestClose(e)
                  }
               }>{p.props.title}</MenuItem>
            )
         }

         //console.log("poplist",poplist);


          let collapseList = []
          for(let k of Object.keys(poplist))
          {
            let collapseId = "pop_"+k+"_"+this.props.individual.id
             let handleCollapse = () => {
                this.toggleCollapseState(collapseId);
             };

             collapseList.push(
               <div key={collapseId}>
               <ListItem onClick={handleCollapse}>
                 <ListItemText primary={k} />
                 {this.state.collapseState[collapseId] ? <ExpandLess /> : <ExpandMore />}
                 </ListItem>
                 <Collapse in={this.state.collapseState[collapseId]} style={{marginLeft:"30px"}}>
                   {poplist[k]}
                 </Collapse>
              </div>
             )
          }

         // console.log("newprops",newprops,propertyTypes,this.props)
         if(this.props.isEditable) lists.push(
            <List key={0}>
               <ListItem style={{paddingLeft:0}}>
                  <ListItemIcon>
                     <IconButton
                        onClick={this.handleClick}
                        style={iconStyle}
                        >
                        <AddCircleIcon style={circleStyle}/>
                     </IconButton>
                  </ListItemIcon>
                  <ListItemText title={this.props.tooltip} primary="Add another property" disableTypography style={listHeaderStyle} />
               </ListItem>

               <Popover
                  open={this.state.open}
                  anchorEl={this.state.anchorEl}
                  anchorOrigin={popStyle}
                  //targetOrigin={{horizontal: 'left', vertical: 'top'}}
                  onClose={this.handleRequestClose}
               >
                  <List>
                    {collapseList}
                  </List>
               </Popover>
            </List>
         ) ;
         //<List>{newprops}</List>)
      }

      //console.log("L",lists)

      return lists;
   }

   getIdList(): React.Element<*> {
      const idProperty = new RDFProperty('ID');
      const idLiteral = new Literal(STRING_TYPE, this.props.individual.id);
      const propertyValues = [idLiteral];

      console.log("getId:propVal",propertyValues,this.props.individual.id);

      const onChange = (value) => {
         this.props.individual.id = value;
         this.forceUpdate();
         if (this.props.onIndividualUpdated) {
            this.props.onIndividualUpdated();
         }
      };

      return <IndividualProperty
         assocResources={this.props.assocResources}
         nested={this.props.nested}
         isEditable={() => true}
         onIndividualUpdated={this.props.onIndividualUpdated}
         onLiteralChanged={onChange}
         onSelectedResource={this.props.onSelectedResource}
         onTapAdd={this.props.onTapAdd}
         onAddResource={this.props.onAddResource}
         individual={this.props.individual}
         level={this.props.level}
         ontology={this.props.ontology}
         property={idProperty}
         propertyValues={propertyValues}
         title={"ID"}
         tooltip={"ID"}
      />;
   }

   getLabelsList(): React.Element<*> | null {
      let labels = this.props.individual.getProperty("http://www.w3.org/2000/01/rdf-schema#label");

      if (!labels) return null;

      const labelProperty = new RDFProperty('http://www.w3.org/2000/01/rdf-schema#label');
      const onLiteralChanged = (event) => {
         //console.log("literalchanged")
         if (this.props.onIndividualUpdated) {
            this.props.onIndividualUpdated();
         }
      };


      let onTapAdd = () => this.addProperty(labelProperty.IRI,labelProperty);

      return (
         <List>
         <IndividualProperty
            nested={this.props.nested}
            isEditable={(propertyValue: any) => this.props.nested && this.props.isEditable }
            onIndividualUpdated={this.props.onIndividualUpdated}
            onLiteralChanged={onLiteralChanged}
            onSelectedResource={this.props.onSelectedResource}
            onTapAdd={onTapAdd}//this.props.onAddResource}
            onAddResource={this.props.onAddResource}
            individual={this.props.individual}
            level={this.props.level}
            ontology={this.props.ontology}
            property={labelProperty}
            propertyValues={labels}
            title={"Label"}
            tooltip={"Labels"}
            assocResources={this.props.assocResources}
         />
         </List>
      )
   }

   onOpenNewTab(event)  {
      //       console.log("NEW",this)
      store.dispatch(ui.editingResourceInNewTab(this.props.individual.id))
   }
   /*
   getSubtitle(txt : string):string
   {

      let subtitle = formatIRI(txt);
      if(this.props.ontology._classes[txt])
      {
         let s = this.props.ontology._classes[txt].label ;
         if(s && s != '') subtitle = s ;
      }
      else if(this.props.ontology._properties[txt])
      {
         let s = this.props.ontology._properties[txt].label ;
         if(s && s != '') subtitle = s ;
      }

      return subtitle[0].toUpperCase() + subtitle.slice(1);
   }
   */

   getNestedTitleList(): React.Element<*> | null {

      if (!this.props.nested && !this.props.titleView) return null;

      let titleView = this.props.titleView;

      console.log("tV",titleView)

      if (!titleView) {
         let title = '';
         let subtitle = '';
         let labels = this.props.individual.getProperty("http://www.w3.org/2000/01/rdf-schema#label");

         console.log("labels",labels)

         if (this.props.individual.types[0])
         {
            subtitle = this.props.ontology.getMainLabel(this.props.individual.types[0]) //+ " / case 0";
         }

         if (labels && labels.length > 0) {
            title = labels[0].value;
            //subtitle = '' ;
         } else if (this.props.individual.id) {
            if(!this.props.individual.hasGeneratedId && !this.props.isExpandable)
            {
               const bdr = "http://purl.bdrc.io/resource/"
               title = this.props.ontology.getMainLabel(this.props.individual.id);
               subtitle = '' // 'case1 ('+title+')' ;
               if(this.props.assocResources && this.props.assocResources[bdr+title.toUpperCase()])
               {
                  subtitle = title //+ " / case 1"
                  title = this.props.assocResources[bdr+title.toUpperCase()].filter(e => e.type && e.type.match(/skos[/]core#prefLabel/) ).map(e => e.value).join("; ") ;
                  if(title === "") {
                     title = this.props.ontology.getMainLabel(this.props.individual.id);
                     subtitle = "" ;
                  }
                  //console.log("subT",title,subtitle)
               }
            }
            else
            {
               /*
               let t = this.props.ontology._classes[].label ;
               if(t && t != '') title = t[0].toUpperCase() + t.slice(1);
               else title = formatIRI(this.props.individual.types[0]);
                  */

               title = this.props.ontology.getMainLabel(this.props.individual.types[0])

               //console.log("case2",this.props.individual,this.state)

               if(!this.state.isExpanded) {

                  const rdf  = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";

                  subtitle = Object.keys(this.props.individual._properties)
                     .filter(e => e !== rdf+'type' && this.props.individual._properties[e].length > 0)
                     .map(e => {
                        let str = this.props.ontology.getMainLabel(e)+": "
                        str += this.props.individual._properties[e].map(v => {
                           let val = ""
                           if(v.value) val = v.value
                           else if(v.id && this.props.assocResources && this.props.assocResources[v.id]) {
                              val = this.props.assocResources[v.id].filter(f => f.type && f.type.match(/skos[/]core#prefLabel/) ).map(f => f.value).join("; ") ;
                           }
                           else val = this.props.ontology.getMainLabel(v.id)
                           return val ;
                        }).join("; ")
                        return str ;
                     }).join(" | ")  //+ ' / case2' ; //this.props.ontology.getMainLabel(this.props.propertyType);

               }
               else subtitle = '' ;
            }
         } else {
            title = <i>&lt;no id&gt;</i>;

            subtitle = '' //'case3' ;
         }


         if(this.props.propertyType && this.props.level >= 2)
         {

            subtitle = this.props.ontology.getMainLabel(this.props.individual.id) //+ "/ case 4";
            //subtitle = this.props.ontology.getMainLabel(this.props.propertyType);

            //subtitle = 'case4' ;
         }


         titleView = [ <ListItemText className="ListItemNoSec"
            primary={title}
            secondary={subtitle}
            /> ]


         }
         else { titleView = [ titleView ] }


         //          if(this.props.showLabel)
         {
            let pref = []

            let lab = this.props.individual.getProperty("http://www.w3.org/2004/02/skos/core#prefLabel") ;
            //console.log("label",lab,this.props.individual)

            if(lab != null && lab.length > 0)
            {
               for(var l of lab) {
                  pref.push(
                     <LiteralView literal={l} isEditable={false} noPrefix={true} />
                  );
               }

               titleView.push(<div className="prefLabel">{pref}</div>)
            }
         }

         this._allowExpansion = this.props.isExpandable && (Object.keys(
            this.props.individual.getProperties()
         ).length > 0
         //|| this.props.isEditable
      );
      let listItem: React.Element<*>;
      if (this._allowExpansion) {
         listItem = []
         listItem.push( <ListItem {...this.props.isEditable ? {className:"noPad"}:{} } button onClick={() => this.toggleExpandedState()}>
         {titleView}

         {this.state.isExpanded ? <ExpandLess /> : <ExpandMore />}


         </ListItem>)

         if(this.props.nested && this.props.level === 0)
         {
            listItem.push(
               <ListItemSecondaryAction className="plusBut">
               <IconButton
                  onClick={this.onOpenNewTab.bind(this)}
               >
               <AddBoxIcon />
               </IconButton>
               </ListItemSecondaryAction>
            )

         }

      } else {
         listItem = <ListItem  button>
         {titleView}

         </ListItem>
      }
      return(
         <List >
         {listItem}
         </List>
      )
   }
      /*
       shouldComponentUpdate(nextProps) {
           return false ;
           //(nextProps.ids !== this.props.ids
            //    || nextProps.data !== this.props.data);
       }
       */

   isCollapse() {

      if( (this._idList && this._idList.length > 0) || (this._labList && this._labList.length > 0) || (this._propList && this._propList.length > 0) )
         return true
      else {
         return false
      }
   }

   prepareRender()
   {

      if (!this.props.nested) {
         //            console.log("idList")
         this._idList = /*this._idList ||*/ this.getIdList();
      }

      this._propList = /*this._propList ||*/ this.getPropertyLists();

      this._labList = /*this._labList ||*/ this.getLabelsList()

      //console.log("prepR",this._idList,this._propList,this._labList)
   }

   render() {

         // COMM
               console.groupCollapsed("indiView/"+this.props.level+"/render",this.props.individual.id,this.props.individual.types[0])
               console.log("iV assoR",this.props.assocResources);

      this.prepareRender()

              console.groupEnd();

      //         console.log("labList",labList);
      //         console.log("propList",propList);

      let classes = ["individualView"];
      if (this.props.isEditable) {
         classes.push("isEditable");
      }
      if (this.props.isExpanded) {
         classes.push("isExpanded");
      }
      if(this.props.className) {
         classes.push(this.props.className);
      }



      let ret = (
         <div className={classnames(...classes,"open"+ this.state.isExpanded, "isCollapse-"+this.isCollapse())} onClick={this.props.onClick}>
         {this.getNestedTitleList()}
         { this.isCollapse() &&
            <Collapse
               in={this.state.isExpanded}
               className={"inCollapse nohide "+ this.state.isExpanded }
               >
            {this._idList}
            {this._labList}
            {this._propList}
            </Collapse>
         }
         </div>
      );




               //console.groupEnd()

      return ret ;

   }
}
