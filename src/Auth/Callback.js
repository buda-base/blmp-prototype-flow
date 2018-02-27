// src/Callback/Callback.js

import React, { Component } from 'react';
import Loader from 'react-loader'
import {auth} from "../routes"
import { connect } from 'react-redux';


const handleAuthentication = (nextState, replace) => {
  if (/access_token|id_token|error/.test(nextState.location.hash)) {
     // console.log("auth?",auth)
    auth.handleAuthentication();
  }
}


type Props = {}

class Callback extends Component<Props>
{
   render()
   {
      // console.log("Route.props",this.props)
      if(this.props.config) { handleAuthentication(this.props.props); }

      return (
        <div>
           <Loader loaded={false}/>
        </div>
     )
   }
}

const mapStateToProps = (state,ownProps) => {
   // console.log("mapS2P",state,ownProps);
   let config = state.data.config;
   return { ...ownProps, config }
}

const AuthCallbackContainer = connect(
    mapStateToProps
)(Callback);

export default AuthCallbackContainer;
