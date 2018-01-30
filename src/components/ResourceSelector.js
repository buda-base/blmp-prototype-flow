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
import IndividualView from 'components/IndividualView';
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
   results:[]
}

export default class ResourceSelector extends React.Component<Props> {
   _textfield = null;
   _textfieldS = null;
   _isValid = false ;
   _notFound = false ;
   _search = false ;

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

      if(txt == 'key') this._search = true ;
      else if(txt == 'res') this._search = false ;
   }

   handleKeypress(e,txt : string = '')
   {
      if(txt == 'key') this._search = true ;
      else if(txt == 'res') this._search = false ;

      if (e.key === 'Enter')
      {
         if(!this._search && this._isValid){ this.selectedResource(); }
         else { this.findResource(); }
      }

   }

   render() {

      let message;
      let isValid;
      let notFound
      if (this.props.findingResourceId) {
         if (this.props.findingResource) {
            isValid = true;
            if (this.props.individual && this.props.property) {
               isValid = validatePropertyValue(this.props.property, this.props.findingResource);
            }
            this._isValid = isValid

            message = <div>
            <Typography>Found:</Typography>
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
         if(this.props.results && this.props.results.length > 0)
         {
            let res = [] ;

            for(let i in this.props.results)
            {
               let r = this.props.results[i]

               let indiv = new Individual(r.s.value)
               indiv.addProperty("http://www.w3.org/2004/02/skos/core#prefLabel",new Literal("http://www.w3.org/1999/02/22-rdf-syntax-ns#langString", r.lit.value, "bo-x-ewts"))

               let p = r.s.value.replace(/^http([^\/]*\/)+([A-Z]+)[0-9].*?$/,"$2")
               console.log("p",p);

               if(directoryPrefixes[p])
               {
                  indiv.types.push("http://purl.bdrc.io/ontology/core/"+directoryPrefixes[p].replace(/s$/,""))
               }
               else { indiv.types.push("?") } 

               console.log("indiv",indiv)

               res.push(<IndividualView
                  onClick={this.selectedResource.bind(this)}
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
               <Typography>Found:</Typography>
                  <List style={{maxHeight: 320, overflow: 'auto'}}>
                     {res}
                  </List>
               </div>
         }
         else if (this.props.findingResourceError) {
            message = <Typography>Error loading resource: {this.props.findingResourceError}</Typography>
         } else {
            message = <Loader loaded={false} />
         }

      }

      /*
      // ...
      */

      console.log("render.props",this.props)

      let view = <Card>
      <CardContent>
      <Typography type="headline" component="h2">
      Select a resource
      </Typography>
      <div style={{display:"inline-block",width:"auto"}}>
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
      <Button  onClick={this.findResource.bind(this)} style={{marginTop:"15px"}}>
      Search
      </Button>
      </CardContent>

      { (this.props.findingResourceId || this.props.searchingResource) &&
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
