import React from 'react';
import { connect } from 'react-redux';

import * as ui from 'state/ui/actions';
import selectors from 'state/selectors';

import IndividualView from 'components/IndividualView';

import store from "../index.js";

/* // no need ... for now
const mapStateToProps = (state,ownProps) => {
    let props = { ...ownProps }
    
    console.log("state2prop",state,ownProps)
    
    return props ;
}
*/
const mapDispatchToProps = (dispatch) => {
    return {
        onSelectedResource: (IRI) => {
           
            //console.log("selected ?",IRI)
            dispatch(ui.selectedResourceIRI(store.getState().ui.activeTabId,IRI));
        }
    }
};

const IndividualViewContainer = connect(
    null, //mapStateToProps,
    mapDispatchToProps
)(IndividualView);

export default IndividualViewContainer;