// @flow
import React from 'react';
import RDFComponent from './RDFComponent';
// import formatIRI from '../../lib/formatIRI';

// import Paper from '@material-ui/core/Paper';

import Popover from '@material-ui/core/Popover';
// import Menu from '@material-ui/core/Menu/Menu.js';
import MenuItem from '@material-ui/core/MenuItem';
import List from '@material-ui/core/List';
// import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
// import ListSubheader from '@material-ui/core/ListSubheader';
// import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
// import ListItemIcon from '@material-ui/core/ListItemIcon';

import store from "../../index.js"

export const IRI = 'http://purl.bdrc.io/ontology/core/Type';

export default class Type extends RDFComponent {
   _list : [] ;

   constructor(props) {
      super(props);

      let onto = store.getState().data.ontology
//       console.log(this.props.individual.types[0],onto._classes[this.props.individual.types[0]]._values);

//       console.log(this.props.individual.types[0],props)
      let n = -1
      if(this.props.isEditable) for(let i in this.props.property.ranges)//this.props.individual.types)
      {
         let t = this.props.property.ranges[i] //.individual.types[i]
//          console.log("t i",t,i)
         if(onto._classes[t] && onto._classes[t].hasAncestorclass(IRI))
         {
            // console.log("thats'it boy", onto._classes[t]._values)
            this._list = onto._classes[t]._values.map((val) =>
            {
               n++;
               return ( <MenuItem key={n} onClick={(ev) => this.handleMenu(ev,val)}>{onto.getMainLabel(val)}</MenuItem> )
            })
         }
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

      let onto = store.getState().data.ontology

        const flexStyle = {flexGrow:1}
        const popStyle = {horizontal: 'left', vertical: 'bottom'}

         return (


           <div style={flexStyle} >
            <ListItemText className="ListItemNoSec"
                  primary={onto.getMainLabel(this.props.individual.id)}
                  //secondary={onto.getMainLabel(this.props.property.ranges[0])}
                  onClick={this.handleClick}
               />

           {
              this.props.isEditable  &&
               <Popover
                  open={this.state.open}
                  anchorEl={this.state.anchorEl}
                  anchorOrigin={popStyle}
                  //targetOrigin={{horizontal: 'left', vertical: 'top'}}
                  onClose={this.handleRequestClose}
               >
                  <List>{this._list}</List>
               </Popover>
           }
         </div>
        )
    }
}
