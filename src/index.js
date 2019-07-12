// import React from 'react';
import ReactDOM from 'react-dom';
import * as ui from 'state/ui/actions';
import * as data from 'state/data/actions';
// import AppContainer from './containers/AppContainer';
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
  // console logging commented as using Redux debug tools
  console.group(action.type)
  console.info('dispatching', action)
  let result = next(action)
  console.log('next state', store.getState())
  console.groupEnd(action.type)
  return result
}

const sagaMiddleware = createSagaMiddleware();
const devToolsOptions = {trace:true};
const composeEnhancers = composeWithDevTools(devToolsOptions);
let store;
//if (process.env.NODE_ENV === 'development') {
    store = createStore(
        rootReducer,
        composeEnhancers(
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


//let id = "T000" ;
//setTimeout(function(){ store.dispatch(data.createResource(id)) },750)
//setTimeout(function(){ store.dispatch(ui.editingResource(1,id)) },1000)


let id, ids = [ "P1" ] //"W22084" , "P1583", "G521", "T2423" ] ;
let loader = (n,iri,t = 0,newTab) => {
    setTimeout(function(){ id = iri },t+50)
    if(newTab) setTimeout(function(){ store.dispatch(ui.newTab()) },t+100)
    setTimeout(function(){ store.dispatch(data.loadResource(id)) },t+250)
    setTimeout(function(){ store.dispatch(ui.editingResource(n,id)) },t+500)
}
for(let i in ids) {
    i = Number(i)
    loader(i+1,ids[i],i*1000,false)
}

// setTimeout(function(){ store.dispatch(ui.togglePreviewPanel(1)) },1000)
