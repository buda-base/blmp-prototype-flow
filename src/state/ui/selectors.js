// @flow
import type { UIState } from './reducers';
import type { AddingResource } from './actions';

export const getSelectedTabId = (state: UIState): number | null => {
    return state.activeTabId;
}

export const getTabsOrder = (state: UIState): number[] => {
    return state.tabsOrder;
}

export const getEditingResourceIRI = (state: UIState, tabId: number): string | null => {
    let editingResourceIRI = null;
    if (state.editingResources[tabId]) {
        editingResourceIRI = state.editingResources[tabId].resourceId;
    }
    return editingResourceIRI;
}

export const getSelectedResourceIRI = (state: UIState, tabId: number): string | null => {
    let selectedResourceIRI = null;
    if (state.editingResources[tabId]) {
        selectedResourceIRI = state.editingResources[tabId].selectedResourceIRI;
    }
    
   //console.log("selected IRI",state,tabId,selectedResourceIRI)
   
    return selectedResourceIRI ;
}

export const getAddingResource = (state: UIState, tabId: number): AddingResource | null => {
    let addingResource = null;
    if (state.editingResources[tabId]) {
        addingResource = state.editingResources[tabId].addingResource;
    }
    return addingResource;
}

export const getFindResource = (state: UIState, tabId: number): string | null => {
    let findResource = null;
    if (state.editingResources[tabId]) {
        findResource = state.editingResources[tabId].findResource;
    }
    return findResource;
}