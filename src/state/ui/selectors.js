// @flow
import type { UIState } from './reducers';

export const getSelectedResourceIRI = (state: UIState): string | null => {
    return state.selectedResourceIRI;
}

export const getAddingResource = (state: UIState): {} | null => {
    return state.addingResource;
}
