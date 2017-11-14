// @flow
import React from 'react';
import { connect } from 'react-redux';

import * as ui from 'state/ui/actions';
import selectors from 'state/selectors';
import Individual from 'lib/Individual';
import RDFProperty from 'lib/RDFProperty';

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