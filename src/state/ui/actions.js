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
    return {
        type: TYPES.findResource,
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