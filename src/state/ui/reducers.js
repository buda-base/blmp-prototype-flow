// @flow
import type { Action } from 'state/actions';
import createReducer from 'lib/createReducer';
import * as actions from './actions';
import type { TabAction, AddingResource } from './actions';
import * as uiActions from 'state/ui/actions';
import Individual from 'lib/Individual';
import RDFProperty from 'lib/RDFProperty';
import selectors from 'state/selectors';

export type TabState = {
    tabId: number,
    resourceId: string | null,
    selectedResourceIRI: string | null,
    addingResource: AddingResource | null,
    findResource: string | null,

    splitWidth:number,
    subSplitWidth:string | number,
    hidePreview:boolean
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
    findResource: null,
    splitWidth:600,
    subSplitWidth:350,
    hidePreview:true,
    graphText:null
}

let reducers = {};

// Helper functions

let LATEST_TAB_ID = 0;
function getNewTabId(): number {
    return ++LATEST_TAB_ID;
}

function updateTabState(tabId: number, state: UIState, key: string, value: any):UIState {
   
    
    let tabState = state.editingResources[tabId];
    
    //console.log("updating",tabState);
    
    tabState = {
        ...tabState,
        [key]: value
    }
    
    //console.log("updated:",tabState);
    
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

export const closeTab = (state: UIState, action: Action) => {
    const tabId = action.payload;
    if (!tabId) {
        return;
    }
    let editingResources = {
        ...state.editingResources
    };
    delete editingResources[tabId];
    const tabsOrder = state.tabsOrder.filter(orderedTabId => orderedTabId !== tabId);
    state = {
        ...state,
        editingResources,
        tabsOrder
    };
    if (tabsOrder.length === 0) state = newTab(state, uiActions.newTab());
    //else state = selectTab(state,uiActions.selectTab(123))
    //console.log('closeTab state: %o', state);

    return state;
}
reducers[actions.TYPES.closeTab] = closeTab;

export const selectTab = (state: UIState, action: Action) => {
    return {
        ...state,
        activeTabId: action.payload
    }
}
reducers[actions.TYPES.selectTab] = selectTab;

export const editingResource = (state: UIState, action: TabAction): UIState => {
    state = updateTabState(action.meta.tabId, state, 'findResource', null);
    state = updateTabState(action.meta.tabId, state, 'resourceId', action.payload);
    return state ;
}
reducers[actions.TYPES.editingResource] = editingResource;

export const selectedResourceIRI = (state: UIState, action: TabAction): UIState => {
    return updateTabState(action.meta.tabId, state, 'selectedResourceIRI', action.payload); // action.meta.tabId);
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




export const resizeCentralPanel = (state: UIState, action: Action) => {
    const tabId = action.meta.tabId ;
    return {
        ...state,
        editingResources: {
            ...state.editingResources,
            [tabId]: {
               ...state.editingResources[tabId],
               splitWidth : action.payload
            }
        }
    }
}
reducers[actions.TYPES.resizeCentralPanel] = resizeCentralPanel;


export const resizePreviewPanel = (state: UIState, action: Action) => {
    const tabId = action.meta.tabId ;
    return {
        ...state,
        editingResources: {
            ...state.editingResources,
            [tabId]: {
               ...state.editingResources[tabId],
               subSplitWidth : action.payload
            }
        }
    }
}
reducers[actions.TYPES.resizePreviewPanel] = resizePreviewPanel;

export const togglePreviewPanel = (state: UIState, action: Action) => {
    const tabId = action.payload ;
    let off = !state.editingResources[tabId].hidePreview ;    
    
    // interesting way of conditionnaly adding attributes    
    // ...(off && { subSplitWidth : "100%" })
    
    return {
        ...state,
        editingResources: {
            ...state.editingResources,
            [tabId]: {
               ...state.editingResources[tabId],
               hidePreview : off
            }
        }
    }
}
reducers[actions.TYPES.togglePreviewPanel] = togglePreviewPanel;


// UI Reducer
const reducer = createReducer(DEFAULT_STATE, reducers);
export default reducer;