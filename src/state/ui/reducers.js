// @flow
import type { Action } from 'state/actions';
import createReducer from 'lib/createReducer';
import * as actions from './actions';
import Individual from 'lib/Individual';

export type UIState = {
    selectedResourceIRI: string | null
}

const DEFAULT_STATE: UIState = {
    selectedResourceIRI: null
}

let reducers = {};

export const selectedResourceIRI = (state: UIState, action: Action) => {
    return {
        ...state,
        selectedResourceIRI: action.payload
    }
};
reducers[actions.TYPES.selectedResourceIRI] = selectedResourceIRI;

// UI Reducer
const reducer = createReducer(DEFAULT_STATE, reducers);
export default reducer;