import React from 'react';
import ReactDOM from 'react-dom';
import * as ui from 'state/ui/actions';
import * as data from 'state/data/actions';
import AppContainer from './containers/AppContainer';
import './index.css';
import { CookiesProvider } from 'react-cookie';

// Material-UI
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import indigo from 'material-ui/colors/indigo';

// Redux
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';

// Saga
import 'babel-polyfill';
import createSagaMiddleware from 'redux-saga';
import rootSaga from 'state/sagas'

// For dev only
import { composeWithDevTools } from 'redux-devtools-extension';

import rootReducer from 'state/reducers';


const logger = store => next => action => {
  console.group(action.type)
  console.info('dispatching', action)
  let result = next(action)
  console.log('next state', store.getState())
  console.groupEnd(action.type)
  return result
}

const sagaMiddleware = createSagaMiddleware();
let store;
//if (process.env.NODE_ENV === 'development') {
    store = createStore(
        rootReducer,
        composeWithDevTools(
            applyMiddleware(sagaMiddleware,logger)
        )
    );
/*
} else {
    store = createStore(
        rootReducer,
        applyMiddleware(sagaMiddleware)
    );
}
*/

export default store ;

sagaMiddleware.run(rootSaga);


const theme = createMuiTheme({
    palette: {
        primary: indigo,
        secondary: indigo
    }
});

ReactDOM.render(
    // setup redux store
    <Provider store={store}>
      <CookiesProvider>
        <MuiThemeProvider theme={theme}>
            <AppContainer />
        </MuiThemeProvider>
     </CookiesProvider>
    </Provider>,
    document.getElementById('root')
);

let id = "G2800" ;
setTimeout(function(){ store.dispatch(data.loadResource(id)) },500)
setTimeout(function(){ store.dispatch(ui.editingResource(1,"http://purl.bdrc.io/resource/"+id)) },1000)
// setTimeout(function(){ store.dispatch(ui.newTab()) },1500)
