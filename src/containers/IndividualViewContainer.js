import React from 'react';
import { connect } from 'react-redux';

import * as ui from 'state/ui/actions';
import selectors from 'state/selectors';

import IndividualView from 'components/IndividualView';

const mapDispatchToProps = (dispatch) => {
    return {
        onSelectedResource: (IRI) => {
            dispatch(ui.selectedResourceIRI(IRI));
        }
    }
};

const IndividualViewContainer = connect(
    null,
    mapDispatchToProps
)(IndividualView);

export default IndividualViewContainer;