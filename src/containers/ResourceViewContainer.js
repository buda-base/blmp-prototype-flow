import { connect } from 'react-redux';

import * as ui from 'state/ui/actions';
import * as data from 'state/data/actions';
import selectors from 'state/selectors';

import ResourceView from 'components/ResourceView';

const mapStateToProps = (state) => {
    let props = {
        IRI: selectors.getSelectedResourceIRI(state),
        resource: null,
        loadingResource: false
    }
    if (props.IRI) {
        props.resource = selectors.getResource(state, props.IRI);
        props.loadingResource = selectors.isResourceLoading(state, props.IRI);
    }
    return props;
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        onSelectedResource: (IRI) => {
            dispatch(ui.selectedResourceIRI(IRI));
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