import React from 'react';
import { connect } from 'react-redux';

import * as ui from 'state/ui/actions';
import selectors from 'state/selectors';
import Individual from 'lib/Individual';
import RDFProperty from 'lib/RDFProperty';

import TabContent from 'components/TabContent';

const mapStateToProps = (state, ownProps) => {
    const ontology = selectors.getOntology(state);
    const tabId = ownProps.tabId;



    let editingResourceIRI;
    let editingResource;
    let individual;
    let editingResourceIsLoading;
    let editingResourceError;

    let findingResource;
    let findingResourceError;
    let findingResourceId;

    let searchingResource;
    let results ;
    let config ;
    let hostError ;

    let addingResource;
    let selectedResourceIRI;

    let widthInfo ;
    let graphText ;

    let addedFoundResource  ;

    let loaded ;

    if (tabId) {

       addedFoundResource = selectors.getAddedFoundResource(state,tabId)

        editingResourceIRI = selectors.getEditingResourceIRI(state, tabId);
        if (editingResourceIRI) {
            editingResource = selectors.getResource(state, editingResourceIRI);
            individual = editingResource;
            editingResourceIsLoading = selectors.isResourceLoading(state, editingResourceIRI);
            editingResourceError = selectors.getResourceError(state, editingResourceIRI);

        }

        findingResourceId = selectors.getFindResource(state, tabId);

        if (findingResourceId) {
            findingResource = selectors.getResource(state, findingResourceId);
            findingResourceError = selectors.getResourceError(state, findingResourceId);
        }
        searchingResource = selectors.getSearchResource(state,tabId);
        if(searchingResource)
        {
            findingResourceError = selectors.getResourceError(state, searchingResource);
            results = selectors.getResults(state, searchingResource);
        }

        addingResource = selectors.getAddingResource(state, tabId);
        selectedResourceIRI = selectors.getSelectedResourceIRI(state, tabId);

        widthInfo = selectors.getWidthInfo(state,tabId);


        /*
        splitWidth,
        subSplitWidth,
        hidePreview
        */
    }

    config = selectors.getConfig(state);
    hostError = selectors.getResourceError(state, "host");

    //console.log("state=",state,ownProps);

    const props = {
      ...ownProps,
        ontology,
        editingResourceIRI,
        editingResource,
        individual,
        editingResourceIsLoading,
        editingResourceError,
        selectedResourceIRI,
        addingResource,
        findingResourceId,
        findingResource,
        findingResourceError,
        searchingResource,
        results,
        config,
        hostError,
        addedFoundResource,
        ...widthInfo
    }

    console.log("props",props)
    // console.log("mapstate2prop?TabContent",state,ownProps,props);

    return props ;
        //graphText

        /*
        splitWidth,
        subSplitWidth,
        hidePreview
        */
};

const mapDispatchToProps = (dispatch, ownProps) => {
    const tabId = ownProps.tabId;

    return {
        onEditingResourceInNewTab: (resourceIRI: string) => {
            dispatch(ui.editingResourceInNewTab(resourceIRI));
        },
        onOpenedResource: (resource: Individual) => {
            dispatch(ui.editingResource(tabId, resource.id));
        },
        onSelectedResource: (IRI: string) => {
            dispatch(ui.selectedResourceIRI(tabId, IRI));
        },
        onAddResource: (indvidual: Individual, property: RDFProperty) => {
           // console.log("addR",indvidual,property);
            dispatch(ui.addingResource(tabId, indvidual, property));
        },
        onCancelAddingResource: () => dispatch(ui.cancelAddingResource(tabId)),
        onFindResource: (id) => {
           // console.log("lets find",id)
            dispatch(ui.findResource(tabId, id))
            // console.log("wefound",id)
        },
        onSearchResource: (id) => {
            // console.log("lets search",id)
            dispatch(ui.searchResource(tabId, id))
        },
        onAddedProperty: () => dispatch(ui.addedFoundResource(tabId)),

        onResizeCentralPanel: (w) => dispatch(ui.resizeCentralPanel(tabId,w)),
        onResizePreviewPanel: (w) => dispatch(ui.resizePreviewPanel(tabId,w)),
        onTogglePreviewPanel: () => dispatch(ui.togglePreviewPanel(tabId))
    }
};

const TabContentContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(TabContent);

export default TabContentContainer;
