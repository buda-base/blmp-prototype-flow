import React from 'react';
import { connect } from 'react-redux';

import * as ui from 'state/ui/actions';
import selectors from 'state/selectors';

import App from 'components/App';

const mapStateToProps = (state) => {
    const findingResourceId = selectors.getFindResource(state);
    let findingResource;
    let findingResourceError;
    if (findingResourceId) {
        findingResource = selectors.getResource(state, findingResourceId);
        findingResourceError = selectors.getResourceError(state, findingResourceId);
    }
    return {
        selectedResourceIRI: selectors.getSelectedResourceIRI(state),
        addingResource: selectors.getAddingResource(state),
        findingResourceId,
        findingResource,
        findingResourceError
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        onSelectedResource: (IRI) => {
            dispatch(ui.selectedResourceIRI(IRI));
        },
        onAddResource: (indvidual: Individual, property: RDFProperty) => {
            dispatch(ui.addingResource(indvidual, property));
        },
        onCancelAddingResource: () => dispatch(ui.cancelAddingResource()),
        onFindResource: (id) => dispatch(ui.findResource(id)),
        onAddedProperty: () => dispatch(ui.addedFoundResource())
    }
};

const AppContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(App);

export default AppContainer;