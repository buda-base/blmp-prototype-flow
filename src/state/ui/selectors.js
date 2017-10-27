// @flow
import type { UIState } from './reducers';
import type { AddingResource } from './actions';

export const getSelectedResourceIRI = (state: UIState): string | null => {
    return state.selectedResourceIRI;
}

export const getAddingResource = (state: UIState): AddingResource | null => {
    return state.addingResource;
}

export const getFindResource = (state: UIState): string | null => {
    return state.findResource;
}