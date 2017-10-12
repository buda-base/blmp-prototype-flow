import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import './index.css';

// Redux
import { createStore, applyMiddleware } from 'redux';
import { Provider, connect } from 'react-redux';

// Saga
import 'babel-polyfill';
import createSagaMiddleware from 'redux-saga';

// For dev only
import Perf from 'react-addons-perf'
import { composeWithDevTools } from 'redux-devtools-extension';

// for Material-UI
import injectTapEventPlugin from 'react-tap-event-plugin';

import rootReducer from 'state/reducers';
let store = createStore(rootReducer);

if (process.env.NODE_ENV === 'development') {
    window.perf = Perf;
    store = createStore(
        rootReducer,
        composeWithDevTools()
    );
}

// Setup material-ui
injectTapEventPlugin();

ReactDOM.render(
    // setup redux store
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);