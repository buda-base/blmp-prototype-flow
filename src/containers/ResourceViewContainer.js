import { connect } from 'react-redux';

import * as ui from 'state/ui/actions';
import * as data from 'state/data/actions';
import selectors from 'state/selectors';

import ResourceView from 'components/ResourceView';

import store from "../index.js";

const mapStateToProps = (state) => {
    
    
    let props = {
        IRI: selectors.getSelectedResourceIRI(state,state.ui.activeTabId),
        resource: null,
        loadingResource: false
    }
   
    //console.log("mapState2Props",state,props);
        
    if (props.IRI) {
        props.resource = selectors.getResource(state, props.IRI);
        props.loadingResource = selectors.isResourceLoading(state, props.IRI);
    }
    return props;
}

const mapDispatchToProps = (dispatch, ownProps) => {
   
   //console.log("dispatch2props?")
   
    return {
        onSelectedResource: (IRI) => {
            dispatch(ui.selectedResourceIRI(store.getState().ui.activeTabId,IRI));
        },
        onLoadResource: (IRI) => {
            dispatch(data.loadResource(IRI));
        }
    };
};

const ResourceViewContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(ResourceView);

export default ResourceViewContainer;