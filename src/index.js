import React from 'react';
import ReactDOM from 'react-dom';
import { initiateApp } from 'state/actions';
import AppContainer from './containers/AppContainer';
import './index.css';

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

const sagaMiddleware = createSagaMiddleware();
let store;
if (process.env.NODE_ENV === 'development') {
    store = createStore(
        rootReducer,
        composeWithDevTools(
            applyMiddleware(sagaMiddleware)
        )
    );
} else {
    store = createStore(
        rootReducer,
        applyMiddleware(sagaMiddleware)
    );
}

sagaMiddleware.run(rootSaga);

store.dispatch(initiateApp());

const theme = createMuiTheme({
    palette: {
        primary: indigo,
        secondary: indigo
    }
});

ReactDOM.render(
    // setup redux store
    <Provider store={store}>
        <MuiThemeProvider theme={theme}>
            <AppContainer />
        </MuiThemeProvider>
    </Provider>,
    document.getElementById('root')
);