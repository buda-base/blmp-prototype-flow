import React from 'react';
import ReactDOM from 'react-dom';
import * as ui from 'state/ui/actions';
import * as data from 'state/data/actions';
import AppContainer from './containers/AppContainer';
import './index.css';

// Redux
import { createStore, applyMiddleware } from 'redux';


// Saga
import 'babel-polyfill';
import createSagaMiddleware from 'redux-saga';
import rootSaga from 'state/sagas'

// For dev only
import { composeWithDevTools } from 'redux-devtools-extension';

import rootReducer from 'state/reducers';

import makeMainRoutes from './routes';

/*
// test ok --> login page
import Auth from './Auth/Auth.js';

const auth = new Auth();
auth.login();
*/

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


const routes = makeMainRoutes();

ReactDOM.render(
   routes,
    document.getElementById('root')
);


// let id = "W000" ;
// setTimeout(function(){ store.dispatch(data.createResource(id)) },750)
// setTimeout(function(){ store.dispatch(ui.editingResource(1,id)) },1000)


//let id = "P1" ;
// setTimeout(function(){ store.dispatch(data.loadResource(id)) },250)
// setTimeout(function(){ store.dispatch(ui.editingResource(1,id)) },500)
// setTimeout(function(){ store.dispatch(ui.newTab()) },750)
// setTimeout(function(){ store.dispatch(ui.togglePreviewPanel(1)) },1000)
