import React from 'react';
import ReactDOM from 'react-dom';
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
import Perf from 'react-addons-perf'
import { composeWithDevTools } from 'redux-devtools-extension';

// for Material-UI
import injectTapEventPlugin from 'react-tap-event-plugin';

import rootReducer from 'state/reducers';

const sagaMiddleware = createSagaMiddleware();
let store = createStore(
    rootReducer,
    applyMiddleware(sagaMiddleware)
);

if (process.env.NODE_ENV === 'development') {
    window.perf = Perf;
    store = createStore(
        rootReducer,
        composeWithDevTools(
            applyMiddleware(sagaMiddleware)
        )
    );
}

sagaMiddleware.run(rootSaga);

// Setup material-ui
injectTapEventPlugin();

ReactDOM.render(
    // setup redux store
    <Provider store={store}>
        <AppContainer />
    </Provider>,
    document.getElementById('root')
);