// src/routes.js

import AppContainer from 'containers/AppContainer';
import React from 'react';
import { Route, Router } from 'react-router-dom';
import Callback from './Auth/Callback';
import Auth from './Auth/Auth';
import history from './history';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import indigo from 'material-ui/colors/indigo';
import { Provider } from 'react-redux';
import { CookiesProvider } from 'react-cookie';
import store from 'index';

const theme = createMuiTheme({
    palette: {
        primary: indigo,
        secondary: indigo
    }
});

export let auth = new Auth();

const handleAuthentication = (nextState, replace) => {
  if (/access_token|id_token|error/.test(nextState.location.hash)) {
    auth.handleAuthentication();
  }
}

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
        <Route path="/callback" render={(props) => {
          handleAuthentication(props);
          return <Callback {...props} />
        }}/>
      </div>
    </Router>

);
}


export default makeMainRoutes ;
