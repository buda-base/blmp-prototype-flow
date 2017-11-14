import React from 'react';
import ReactDOM from 'react-dom';
import { initiateApp } from 'state/actions';
import AppContainer from './containers/AppContainer';
import './index.css';

// Redux
import { createStore, applyMiddleware } from 'redux';
import { Provider, connect } from 'react-redux';

// Saga
import 'babel-polyfill';
import createSagaMiddleware from 'redux-saga';
import rootSaga from 'state/sagas'

// For dev only
import { composeWithDevTools } from 'redux-devtools-extension';

import rootReducer from 'state/reducers';

const sagaMiddleware = createSagaMiddleware();
let store = createStore(
    rootReducer,
    applyMiddleware(sagaMiddleware)
);

if (process.env.NODE_ENV === 'development') {
    store = createStore(
        rootReducer,
        composeWithDevTools(
            applyMiddleware(sagaMiddleware)
        )
    );
}

sagaMiddleware.run(rootSaga);

store.dispatch(initiateApp());

ReactDOM.render(
    // setup redux store
    <Provider store={store}>
        <AppContainer />
    </Provider>,
    document.getElementById('root')
);