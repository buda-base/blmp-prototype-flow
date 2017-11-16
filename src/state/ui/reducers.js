// @flow
import type { Action } from 'state/actions';
import createReducer from 'lib/createReducer';
import * as actions from './actions';
import type { TabAction, AddingResource } from './actions';
import Individual from 'lib/Individual';
import RDFProperty from 'lib/RDFProperty';

export type TabState = {
    tabId: number,
    resourceId: string | null,
    selectedResourceIRI: string | null,
    addingResource: AddingResource | null,
    findResource: string | null
}

export type UIState = {
    editingResources: {[tabId: number]: TabState},
    activeTabId: number | null,
    tabsOrder: number[]
}

const DEFAULT_STATE: UIState = {
    editingResources: {},
    activeTabId: null,
    tabsOrder: []
}

const DEFAULT_TAB_STATE: TabState = {
    tabId: 0,
    resourceId: null,
    selectedResourceIRI: null,
    addingResource: null,
    findResource: null
}

let reducers = {};

// Helper functions

let LATEST_TAB_ID = 0;
function getNewTabId(): number {
    return ++LATEST_TAB_ID;
}

function updateTabState(tabId: number, state: UIState, key: string, value: any):UIState {
    let tabState = state.editingResources[tabId];
    tabState = {
        ...tabState,
        [key]: value
    }
    return {
        ...state,
        editingResources: {
            ...state.editingResources,
            [tabId]: tabState
        }
    }
}

// Reducers

export const newTab = (state: UIState, action: Action) => {
    const tabId = getNewTabId();
    return {
        ...state,
        editingResources: {
            ...state.editingResources,
            [tabId]: {
                ...DEFAULT_TAB_STATE,
                tabId
            }
        },
        activeTabId: tabId,
        tabsOrder: [
            ...state.tabsOrder,
            tabId
        ]
    }
}
reducers[actions.TYPES.newTab] = newTab;

export const selectTab = (state: UIState, action: Action) => {
    return {
        ...state,
        activeTabId: action.payload
    }
}
reducers[actions.TYPES.selectTab] = selectTab;

export const editingResource = (state: UIState, action: TabAction): UIState => {
    return updateTabState(action.meta.tabId, state, 'resourceId', action.payload);
}
reducers[actions.TYPES.editingResource] = editingResource;

export const selectedResourceIRI = (state: UIState, action: TabAction): UIState => {
    return updateTabState(action.meta.tabId, state, 'selectedResourceIRI', action.payload);
};
reducers[actions.TYPES.selectedResourceIRI] = selectedResourceIRI;

export const addingResource = (state: UIState, action: actions.AddingResourceAction): UIState => {
    return updateTabState(action.meta.tabId, state, 'addingResource', action.payload);
    
}
reducers[actions.TYPES.addingResource] = addingResource;

export const cancelAddingResource = (state: UIState, action: TabAction): UIState => {
    return updateTabState(action.meta.tabId, state, 'addingResource', null);
}
reducers[actions.TYPES.cancelAddingResource] = cancelAddingResource;

export const findResource = (state: UIState, action: TabAction): UIState => {
    return updateTabState(action.meta.tabId, state, 'findResource', action.payload);
}
reducers[actions.TYPES.findResource] = findResource;

export const addedFoundResource = (state: UIState, action: TabAction): UIState => {
    state = updateTabState(action.meta.tabId, state, 'addingResource', null);
    state = updateTabState(action.meta.tabId, state, 'findResource', null);
    return state;
}
reducers[actions.TYPES.addedFoundResource] = addedFoundResource;

// UI Reducer
const reducer = createReducer(DEFAULT_STATE, reducers);
export default reducer;