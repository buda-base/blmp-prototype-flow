// @flow
import React from 'react';
import RDFComponent from './RDFComponent';
import formatIRI from '../../lib/formatIRI';

import Paper from 'material-ui/Paper';

import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu/Menu.js';
import {MenuItem} from 'material-ui/Menu';
import List, {ListItem, ListItemText, ListSubheader, ListItemSecondaryAction, ListItemIcon} from 'material-ui/List';

export const IRI = 'http://purl.bdrc.io/ontology/core/PlaceType';

export default class PlaceType extends RDFComponent {

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
           
            <Popover
               open={this.state.open}
               anchorEl={this.state.anchorEl}
               anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
               //targetOrigin={{horizontal: 'left', vertical: 'top'}}
               onRequestClose={this.handleRequestClose}
            >
               <List >
                  <MenuItem onClick={(ev) => this.handleMenu(ev,"YOUPI")}>youpi</MenuItem>
                  <MenuItem onClick={(ev) => this.handleMenu(ev,"SAD")}>sad</MenuItem>
               </List>
            </Popover>
         </div>
        )
    }
}