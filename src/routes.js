// src/routes.js

import { connect } from 'react-redux';
import AppContainer from 'containers/AppContainer';
import React,{Component} from 'react';
import { Route, Router } from 'react-router-dom';
import AuthCallbackContainer from './Auth/Callback';
import Auth from './Auth/Auth';
import history from './history';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import indigo from '@material-ui/core/colors/indigo';
import { Provider } from 'react-redux';
import { CookiesProvider } from 'react-cookie';
import store from 'index';
import Loader from "react-loader"

const theme = createMuiTheme({
    palette: {
        primary: indigo,
        secondary: indigo
    }
});

export let auth = new Auth();

export const makeMainRoutes = () => {

/* // test ok
return (<Router history={history} >
   <div>
      <Route path="/" render={(props) => <div>is ok</div>} />
      <Route path="/home" component={Home} />
      <Route path="/about" component={About} />
  </div>
</Router>)

   */
  return (


    <Router history={history}>
      <div>
        <Route path="/" render={(props) =>
           <Provider store={store}>
            <CookiesProvider>
              <MuiThemeProvider theme={theme}>
                   <AppContainer auth={auth} {...props} />
              </MuiThemeProvider>
            </CookiesProvider>
         </Provider>}/>
        <Route path="/auth/callback" render={(props) =>
           <Provider store={store}>
             <AuthCallbackContainer props={props} />
          </Provider>
        } />
      </div>
    </Router>

);
}


export default makeMainRoutes ;
