// @flow
import type { Action } from 'state/actions';
import createReducer from 'lib/createReducer';
import * as actions from './actions';
import Individual from 'lib/Individual';
import RDFProperty from 'lib/RDFProperty';

export type UIState = {
    selectedResourceIRI: string | null,
    addingResource: {individual: Individual, property: RDFProperty} | null,
    findResource: string | null
}

const DEFAULT_STATE: UIState = {
    selectedResourceIRI: null,
    addingResource: null,
    findResource: null
}

let reducers = {};

export const selectedResourceIRI = (state: UIState, action: Action) => {
    return {
        ...state,
        selectedResourceIRI: action.payload
    }
};
reducers[actions.TYPES.selectedResourceIRI] = selectedResourceIRI;

export const addingResource = (state: UIState, action: actions.AddingResourceAction) => {
    return {
        ...state,
        addingResource: {
            individual: action.payload.individual,
            property: action.payload.property
        }
    }
}
reducers[actions.TYPES.addingResource] = addingResource;

export const cancelAddingResource = (state: UIState, action: Action) => {
    return {
        ...state,
        addingResource: null
    }
}
reducers[actions.TYPES.cancelAddingResource] = cancelAddingResource;

export const findResource = (state: UIState, action: Action) => {
    return {
        ...state,
        findResource: action.payload
    }
}
reducers[actions.TYPES.findResource] = findResource;

export const addedFoundResource = (state: UIState, action: Action) => {
    return {
        ...state,
        addingResource: null,
        findResource: null
    }
}
reducers[actions.TYPES.addedFoundResource] = addedFoundResource;

// UI Reducer
const reducer = createReducer(DEFAULT_STATE, reducers);
export default reducer;