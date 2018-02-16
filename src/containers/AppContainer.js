// @flow
import React from 'react';
import { connect } from 'react-redux';

import selectors from 'state/selectors';

import App from 'components/App';

const mapStateToProps = (state,ownProps) => {
    const selectedTabId = selectors.getSelectedTabId(state);
    const saving = selectors.getSaving(state);


    const props =  {
      saving,
      selectedTabId
    }

    console.log("mapstate2prop?App",state,ownProps,props);

    return props
};

const AppContainer = connect(
    mapStateToProps
)(App);

export default AppContainer;
