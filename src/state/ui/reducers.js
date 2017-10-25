// @flow
import type { Action } from 'state/actions';
import createReducer from 'lib/createReducer';
import * as actions from './actions';
import Individual from 'lib/Individual';
import RDFProperty from 'lib/RDFProperty';

export type UIState = {
    selectedResourceIRI: string | null,
    addingResource: null | {individual: Individual, property: RDFProperty}
}

const DEFAULT_STATE: UIState = {
    selectedResourceIRI: null,
    addingResource: null
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

// UI Reducer
const reducer = createReducer(DEFAULT_STATE, reducers);
export default reducer;