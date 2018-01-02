// @flow
import React from 'react';
import RDFComponent from './RDFComponent';
import formatIRI from '../../lib/formatIRI';

import Paper from 'material-ui/Paper';

import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu/Menu.js';
import {MenuItem} from 'material-ui/Menu';
import List, {ListItem, ListItemText, ListSubheader, ListItemSecondaryAction, ListItemIcon} from 'material-ui/List';

import store from "../../index.js"

export const IRI = 'http://purl.bdrc.io/ontology/core/Type';

export default class Type extends RDFComponent {
   _list : [] ;
   
   constructor(props) {
      super(props);
      
      let onto = store.getState().data.ontology
//       console.log(this.props.individual.types[0],onto._classes[this.props.individual.types[0]]._values);
      
      console.log(this.props.individual.types[0],props)
      
      if(this.props.isEditable) for(let i in this.props.individual.types)
      {
         let t = this.props.individual.types[i]
//          console.log("t i",t,i)
         if(onto._classes[t].hasSuperclass(IRI)) this._list = onto._classes[t]._values.map((val) => 
         {
            return ( <MenuItem onClick={(ev) => this.handleMenu(ev,val)}>{formatIRI(val)}</MenuItem> )
         })
      }
            
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
      
      this.props.individual.id = value ;
      
      this.props.onChange()      
        
      console.log("value",value,this.props,this._individual,this.props.individual);
      
      this.setState({
         open: false,
      })
   };
   

    render() {
       
         return (
        
           <div style={{flexGrow:1}} >
            <ListItemText
                  primary={formatIRI(this.props.individual.id)}
                  secondary={formatIRI(this.props.individual.types[0])}
                  onClick={this.handleClick}
               />
           
           { 
              this.props.isEditable  &&
               <Popover
                  open={this.state.open}
                  anchorEl={this.state.anchorEl}
                  anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                  //targetOrigin={{horizontal: 'left', vertical: 'top'}}
                  onRequestClose={this.handleRequestClose}
               >
                  <List>{this._list}</List>
               </Popover>
           }
         </div>
        )
    }
}