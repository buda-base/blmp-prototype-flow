// @flow
import type { Action } from 'state/actions';
import createReducer from 'lib/createReducer';
import * as ui from 'state/actions/ui';

const DEFAULT_STATE = {
    selectedResource: null,
}

let reducers = {};

export const selectedResource = (state: {}, action: Action) => {
    return {
        ...state,
        selectedResource: action.payload
    }
};
reducers[ui.selectedResource().type] = selectedResource;

const reducer = createReducer(DEFAULT_STATE, reducers);

export default reducer;