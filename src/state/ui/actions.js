// @flow
import { createAction } from 'redux-actions';
import type { Action } from 'state/actions';
import Individual from 'lib/Individual';
import RDFProperty from 'lib/RDFProperty';
// import { string } from 'rdflib/lib/util';

type Tab = {
    meta: {
        tabId: number
    }
}

export type TabAction = Action & Tab;

export const TYPES = {};

TYPES.loggedIn = 'LOGGED_IN';
export const loggedIn = createAction(TYPES.loggedIn);

TYPES.loggedOut = 'LOGGED_OUT';
export const loggedOut = createAction(TYPES.loggedOut);

TYPES.newTab = 'NEW_TAB';
export const newTab = createAction(TYPES.newTab);

TYPES.selectTab = 'SELECT_TAB';
export const selectTab = createAction(TYPES.selectTab, tabId => tabId);

TYPES.closeTab = 'CLOSE_TAB';
export const closeTab = createAction(TYPES.closeTab, tabId => tabId);

TYPES.editingResource = 'EDITING_RESOURCE';
export const editingResource = (tabId: number, resourceIRI: string): TabAction => {
    return {
        type: TYPES.editingResource,
        payload: resourceIRI,
        meta: {
            tabId
        }
    }
}
TYPES.editingResourceInNewTab = 'EDITING_RESOURCE_IN_NEW_TAB';
export const editingResourceInNewTab = (resourceIRI: string): TabAction => {

    return {
        type: TYPES.editingResourceInNewTab,
        payload: resourceIRI,
    }
}

TYPES.selectedResourceIRI = 'SELECT_RESOURCE_IRI';
export const selectedResourceIRI = (tabId: number, IRI: string): TabAction => {

   //console.log("action",tabId,IRI);

    return {
        type: TYPES.selectedResourceIRI,
        payload: IRI,
        meta: {
            tabId
        }
    }
}

export type AddingResource = {
    individual: Individual,
    property: RDFProperty
}

export type AddingResourcePayload = {
    payload: AddingResource
}
export type AddingResourceAction = Action & AddingResourcePayload & Tab;

TYPES.addingResource = 'ADDING_RESOURCE';
export const addingResource = (tabId: number, individual: Individual, property: RDFProperty): AddingResourceAction => {
    return {
        type: TYPES.addingResource,
        payload: {
            individual,
            property
        },
        meta: {
            tabId: tabId
        }
    }
}

TYPES.cancelAddingResource = 'CANCEL_ADDING_RESOURCE';
export const cancelAddingResource = (tabId: number): TabAction => {
    return {
        type: TYPES.cancelAddingResource,
        payload: null,
        meta: {
            tabId
        }
    }
}

TYPES.findResource = 'FIND_RESOURCE';
// export const findResource = createAction(TYPES.findResource, id => id);
export const findResource = (tabId: number, resourceId: string): TabAction => {

// console.log("finding...")

    return {
        type: TYPES.findResource,
        payload: resourceId,
        meta: {
            tabId
        }
    }
}

TYPES.searchResource = 'SEARCH_RESOURCE';
export const searchResource = (tabId: number, resourceId: string): TabAction => {

console.log("searching...")

    return {
        type: TYPES.searchResource,
        payload: resourceId,
        meta: {
            tabId
        }
    }
}

TYPES.addedFoundResource = 'ADDED_FOUND_RESOURCE';
// export const addedFoundResource = createAction(TYPES.addedFoundResource);
export const addedFoundResource = (tabId: number): TabAction => {
    return {
        type: TYPES.addedFoundResource,
        payload: null,
        meta: {
            tabId
        }
    }
}



TYPES.resizeCentralPanel = 'RESIZE_CENTRAL_PANEL';
export const resizeCentralPanel = (tabId: number, width:number): TabAction => {
    return {
        type: TYPES.resizeCentralPanel,
        payload: width,
        meta: {
            tabId
        }
    }
}

TYPES.resizePreviewPanel = 'RESIZE_PREVIEW_PANEL';
export const resizePreviewPanel = (tabId: number, width:number): TabAction => {
    return {
        type: TYPES.resizePreviewPanel,
        payload: width,
        meta: {
            tabId
        }
    }
}

TYPES.togglePreviewPanel = 'TOGGLE_PREVIEW_PANEL';
export const togglePreviewPanel = (tabId: number): TabAction => {
    return {
        type: TYPES.togglePreviewPanel,
        payload: tabId
    }
}

TYPES.savingData = 'SAVING_DATA';
export const savingData = (): TabAction => {
    return {
        type: TYPES.savingData
    }
}

TYPES.savedData = 'SAVED_DATA';
export const savedData = (): TabAction => {
    return {
        type: TYPES.savedData
    }
}
