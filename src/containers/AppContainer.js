// @flow
import React from 'react';
import { connect } from 'react-redux';

import selectors from 'state/selectors';

import App from 'components/App';

const mapStateToProps = (state) => {
    const selectedTabId = selectors.getSelectedTabId(state);
    
    return {
        selectedTabId
    }
};

const AppContainer = connect(
    mapStateToProps
)(App);

export default AppContainer;