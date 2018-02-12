// @flow
import {directoryPrefixes} from 'api/api';
import Literal from 'lib/Literal';
import * as data from 'state/data/actions';
import * as ui from 'state/ui/actions';
import store from 'index';
import React from 'react';
import Dialog, {
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
} from 'material-ui/Dialog';
import Card, { CardActions, CardContent } from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import Popover from 'material-ui/Popover';
import {MenuItem} from 'material-ui/Menu';
import IndividualView from 'components/IndividualView';
import {ListItem, ListItemText, ListItemIcon} from 'material-ui/List';
import CloudOffIcon from 'material-ui-icons/CloudOff';
import CloudDoneIcon from 'material-ui-icons/CloudDone';
import Loader from 'react-loader';

import List from 'material-ui/List';
import Ontology from 'lib/Ontology';
import RDFProperty from 'lib/RDFProperty';
import Individual from 'lib/Individual';

function validatePropertyValue(property: RDFProperty, individual: Individual): boolean {
   let isValid = false;
   for (let resourceType of individual.types) {
      if (property.ranges.indexOf(resourceType) !== -1) {
         isValid = true;
         break;
      }
   }
   return isValid;
}

type Props = {
   isDialog: boolean,
   individual?: Individual,
   property?: RDFProperty,
   addedProperty?: () => void,
   selectedResource?: (resource: Individual) => void,
   findResource: (search: string) => void,
   cancel: () => void,
   findingResourceId?: string,
   findingResource?: Individual,
   findingResourceError?: string,
   searchResource: (search: string) => void,
   searchingResource?: string,
   ontology: Ontology,
   results:[],
   config:{},
   hostError:string|null
}

export default class ResourceSelector extends React.Component<Props> {
   _textfield = null;
   _textfieldS = null;
   _textfieldUrl = null;
   _isValid = false ;
   _notFound = false ;
   _search = false ;

   constructor(props) {
      super(props);

      this.state = {
         open: false,
      };
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

      console.log("value",value,this.props);
      store.dispatch(data.choosingHost(value))

      this.setState({
         open: false,
      })
   };


   selectResult(e:Event, IRI:string)
   {
      store.dispatch(data.loadResult(IRI.replace(/^.*\/([^/]+)$/,"$1")))

   }
   selectedResource() {
      if (this.props.findingResource && this.props.individual && this.props.property) {
         const individual = this.props.individual;
         const property = this.props.property;
         individual.addProperty(property.IRI, this.props.findingResource);

         if (this.props.addedProperty) {
            this.props.addedProperty();
         }
      } else if (this.props.selectedResource && this.props.findingResource) {
         this.props.selectedResource(this.props.findingResource);
      }
   }

   createdResource() {
      // console.log("create",this.props)

      store.dispatch(data.createResource(this.props.findingResourceId))
      store.dispatch(ui.editingResource(store.getState().ui.activeTabId, this.props.findingResourceId))
   }

   findResource() {
      if(!this._search)
      {
         const searchTerm = this._textfield.value;
         if (searchTerm)
         {
            this.props.findResource(searchTerm.toUpperCase());
         }
      }
      else {
         const searchTerm = this._textfieldS.value;
         if (searchTerm)
         {
            this.props.searchResource(searchTerm.toUpperCase());
         }
      }
   }

   handleChange(e,txt : string = '')
   {
      this._isValid = false ;

      if(txt === 'key') this._search = true ;
      else if(txt === 'res') this._search = false ;
   }

   handleKeypress(e,txt : string = '')
   {
      if(txt === 'key') this._search = true ;
      else if(txt === 'res') this._search = false ;

      if (e.key === 'Enter')
      {
         if(!this._search && this._isValid){ this.selectedResource(); }
         else { this.findResource(); }
      }

   }

   handleEndpoint(e)
   {
      if (e.key === 'Enter')
      {
         this.handleMenu(e,this._textfieldUrl.value)
         this._textfieldUrl.value = "" ;
      }
   }


   render() {

      let message;
      let isValid;

      let host,menu ;
      if(this.props.config)
      {
         host = this.props.config.ldspdi.endpoints[this.props.config.ldspdi.index]
         menu = this.props.config.ldspdi.endpoints.map((e) => <MenuItem onClick={(ev) => this.handleMenu(ev,e)}>{e}</MenuItem> )
         menu.push(<TextField
            style={{marginLeft:"15px",marginBottom:"10px"}}
            label="New URL"
            id="url"
            type="text"
            inputRef={(url) => this._textfieldUrl = url } //; this._focus = false ;  console.log("ref");} }
            onKeyPress={(e) => this.handleEndpoint(e)}
         />)
         /*
            inputRef={(searchInput) => this._textfield = searchInput } //; this._focus = false ;  console.log("ref");} }
            onKeyPress={(e) => this.handleKeypress(e,"res")}
            onChange={ (e) => this.handleChange(e,"res")}
   */
      }

      if (this.props.hostError) {
         message = <Typography>Error reaching {host} : {this.props.hostError}</Typography>
      }
      else if (this.props.findingResourceId) {
         if (this.props.findingResource) {
            isValid = true;
            if (this.props.individual && this.props.property) {
               isValid = validatePropertyValue(this.props.property, this.props.findingResource);
            }
            this._isValid = isValid

            message = <div>
               <Typography>{"Found:"}</Typography>
               <IndividualView
                  onClick={this.selectedResource.bind(this)}
                  individual={this.props.findingResource}
                  isEditable={false}
                  isExpanded={false}
                  isExpandable={false}
                  nested={true}
                  level={0}
                  showLabel={true}
                  ontology={this.props.ontology}
               />
               {!isValid &&
                  <p>Error: this resource is not valid for this property.</p>
               }
            </div>
         } else if (this.props.findingResourceError) {
            message = <Typography>Error loading resource: {this.props.findingResourceError}</Typography>
         } else {
            message = <Loader loaded={false} />
         }
      }
      else if(this.props.searchingResource)
      {
         console.log("results",this.props.results)
         if(this.props.results && this.props.results.numResults > 0)
         {
            let res = [] ;

            for(let i in this.props.results.rows)
            {
               let r = this.props.results.rows[i].dataRow

               let id = r.s.replace(/^.*> *(.*)<.*$/,"$1")
               let lab = r.lit.replace(/@.*/,"")
               let lang = r.lit.replace(/.*@/,"@")
               let p = id[0]
               let indiv ;

               console.log("dbg",lab,lang,id,p,directoryPrefixes[p])

               if(directoryPrefixes[p])
               {
                  indiv = new Individual(id)
                  indiv.types.push("http://purl.bdrc.io/ontology/core/"+directoryPrefixes[p].replace(/s$/,""))
               }
               else {
                  indiv = new Individual("?")
                  indiv.types.push("Blank Node")
               }

               indiv.addProperty("http://www.w3.org/2004/02/skos/core#prefLabel",new Literal("http://www.w3.org/1999/02/22-rdf-syntax-ns#langString", lab, lang))

               console.log("indiv",indiv)

               res.push(<IndividualView
                  onClick={(e) => this.selectResult(e,id)}
                  individual={indiv}
                  isEditable={false}
                  isExpanded={false}
                  isExpandable={false}
                  nested={true}
                  level={0}
                  showLabel={true}
                  ontology={this.props.ontology}
               />)
            }

            message =
            <div>
               <Typography>{"Found:"}</Typography>
               <List style={{maxHeight: 320, overflow: 'auto'}}>
                  {res}
               </List>
            </div>
         }
         else if(this.props.results && this.props.results.numResults == 0)
         {
            message = <Typography>No results found.</Typography>
         }
        else if (this.props.findingResourceError) {
            message = <Typography>Error loading resource: {this.props.findingResourceError}</Typography>
         }
         else {
            message = <Loader loaded={false} />
         }

      }


      /*
      // ...
      */


      // console.log("render.props",this.props)

      let col = (this.props.hostError ? "red":"green")
      let icon = (this.props.hostError ? <CloudOffIcon/>:<CloudDoneIcon/>)

      let view = <Card>
         <CardContent>
            <Typography type="headline" component="h2">
               Select a resource
            </Typography>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
               <TextField
                  autoFocus
                  label="Resource ID"
                  id="resourceID"
                  type="text"
                  inputRef={(searchInput) => this._textfield = searchInput } //; this._focus = false ;  console.log("ref");} }
                  onKeyPress={(e) => this.handleKeypress(e,"res")}
                  onChange={ (e) => this.handleChange(e,"res")}
               />
               <span style={{textAlign:"center",width:"60px",display:"inline-block"}}>or</span>
               <TextField
                  inputRef={(searchInput) => this._textfieldS = searchInput } //; this._focus = true ; console.log("refS"); } }
                  label="Keyword(s)"
                  id="keyword"
                  type="text"
                  onKeyPress={(e) => this.handleKeypress(e,"key")}
                  onChange={ (e) => this.handleChange(e,"key")}
               />
            </div>
            <br/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
               <Button  onClick={this.findResource.bind(this)} style={{marginTop:"15px"}}>
                  Search
               </Button>
               <Button style={{marginTop:"15px",padding:"0"}} onClick={this.handleClick}>
               <ListItem style={{display:"flex",justifyContent:"space-between"}}>
                  <ListItemText
                     style={{textTransform:"none",textAlign:"left",paddingRight:"0"}}
                     primary={host}
                     secondary="Endpoint"
                  />
                  <ListItemIcon style={{marginRight:"0",marginLeft:"15px",color:col}}>{icon}</ListItemIcon>
               </ListItem>
               </Button>

                  <Popover
                     open={this.state.open}
                     anchorEl={this.state.anchorEl}
                     anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                     //targetOrigin={{horizontal: 'left', vertical: 'top'}}
                     onRequestClose={this.handleRequestClose}
                  >
                     <List>{menu}</List>
                  </Popover>

            </div>

         </CardContent>

         { (this.props.findingResourceId || this.props.hostError || this.props.searchingResource) &&
            <CardContent>
               {message}
            </CardContent>
         }

         <CardContent>
            {this.props.isDialog &&
               <Button onClick={this.props.cancel}>
                  Cancel
               </Button>
            }
            {isValid &&
               <Button onClick={this.selectedResource.bind(this)}>
                  Select
               </Button>
            }
            {!isValid && !this._search && this.props.findingResourceError && this.props.findingResourceError.match(/The resource does not exist.$/) &&
               <Button onClick={this.createdResource.bind(this)}>
                  Create
               </Button>
            }
         </CardContent>
      </Card>

      if (this.props.isDialog) {
         view = <Dialog open={true}>{view}</Dialog>
      }

      return(
         view
      );

      /*
      return(
      <div>
      <p>ResourceSelector!</p>
      <Dialog open={this.props.isOpen}>
      <DialogTitle>Select a resource</DialogTitle>
      <DialogContent>
      <DialogContentText>
      Please enter the ID of the resource you would like to use.
   </DialogContentText>
   <TextField
   autoFocus
   label="Resource ID"
   id="resourceID"
   type="text"
   inputRef={(searchInput) => this._textfield = searchInput}
/>
<Button onClick={this.findResource.bind(this)}>
Search
</Button>
</DialogContent>

{this.props.findingResourceId &&
<DialogContent>
{message}
</DialogContent>
}

<DialogActions>
<Button onClick={this.props.cancel}>
Cancel
</Button>
{isValid &&
<Button onClick={this.selectedResource.bind(this)}>
Select
</Button>
}
</DialogActions>
</Dialog>
</div>
);
*/
}
}
