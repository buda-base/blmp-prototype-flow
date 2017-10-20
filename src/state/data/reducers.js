// @flow
import type { Action } from 'state/actions';
import createReducer from 'lib/createReducer';
import * as actions from './actions';
import Individual from 'lib/Individual';

export type DataState = {
    loading: {[string]: boolean},
    resources: {[IRI:string]: Individual},
}

const DEFAULT_STATE: DataState = {
    loading: {},
    resources: {}
}

let reducers = {};

export const loading = (state: DataState, action: actions.LoadingAction) => {
    return {
        ...state,
        loading: {
            ...state.loading,
            [action.payload.id]: action.payload.isLoading
        }
    }
}
reducers[actions.TYPES.loading] = loading;

export const loadedResource = (state: DataState, action: actions.LoadedResourceAction) => {
    state = loading(state, actions.loading(action.payload.IRI, false));
    return {
        ...state,
        resources: {
            ...state.resources,
            [action.payload.IRI]: action.payload.individual
        }
    }
}
reducers[actions.TYPES.loadedResource] = loadedResource;

// Data Reducer
const reducer = createReducer(DEFAULT_STATE, reducers);
export default reducer;