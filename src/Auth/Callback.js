// src/Callback/Callback.js

import React, { Component } from 'react';
import Loader from 'react-loader'

class Callback extends Component {
  render() {

    return (
      <div>
         <Loader loaded={false}/>
      </div>
    );
  }
}

export default Callback;
