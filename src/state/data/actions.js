// @flow
import { createAction } from 'redux-actions';
import type { Action } from 'state/actions';
import Individual from 'lib/Individual';

export const TYPES = {};

export type LoadingAction = {
    type: string,
    payload: {
        id: string,
        isLoading: boolean
    }
}

TYPES.loading = 'LOADING';
export const loading = (id: string, isLoading: boolean): LoadingAction => {
    return {
        type: TYPES.loading,
        payload: {
            id: id,
            isLoading
        }
    }
}

TYPES.loadResource = 'LOAD_RESOURCE';
export const loadResource = (IRI: string): Action => {
    return {
        type: TYPES.loadResource,
        payload: IRI
    }
}

export type LoadedResourceAction = {
    type: string,
    payload: {
        IRI: string,
        individual: Individual
    }
}
TYPES.loadedResource = 'LOADED_RESOURCE';
export const loadedResource = (IRI: string, individual: Individual): LoadedResourceAction => {
    return {
        type: TYPES.loadedResource,
        payload: {
            IRI,
            individual
        }
    }
}

export type ResourceFailedAction = {
    type: string,
    payload: {
        IRI: string,
        error: string
    }
}
TYPES.resourceFailed = 'RESOURCE_FAILED';
export const resourceFailed = (IRI: string, error: string): ResourceFailedAction => {
    return {
        type: TYPES.resourceFailed,
        payload: {
            IRI,
            error
        }
    }
}