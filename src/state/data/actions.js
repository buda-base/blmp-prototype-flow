// @flow
// import { createAction } from 'redux-actions';
import type { Action } from 'state/actions';
import Individual from 'lib/Individual';
import Ontology from '../../lib/Ontology';

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

/*
TYPES.assocResources = 'ASSOC_RESOURCES';
export const assocResources = (IRI: string, res:{}): Action => {
    return {
        type: TYPES.assocResources,
        payload: IRI,
        meta:res
    }
}
*/

TYPES.loadResource = 'LOAD_RESOURCE';
export const loadResource = (IRI: string): Action => {
    return {
        type: TYPES.loadResource,
        payload: IRI
    }
}

TYPES.loadedConfig = 'LOADED_CONFIG';
export const loadedConfig = (config: {}): Action => {
    return {
        type: TYPES.loadedConfig,
        payload: config
    }
}

TYPES.weHaveCookies = 'WE_HAVE_COOKIES';
export const weHaveCookies = (cookies: {}): Action => {
    return {
        type: TYPES.weHaveCookies,
        payload: cookies
    }
}

TYPES.choosingHost = 'CHOOSING_HOST';
export const choosingHost = (host: string): Action => {
    return {
        type: TYPES.choosingHost,
        payload: host
    }
}

TYPES.chosenHost = 'CHOSEN_HOST';
export const chosenHost = (host: string): Action => {
    return {
        type: TYPES.chosenHost,
        payload: host
    }
}

TYPES.loadResult = 'LOAD_RESULT';
export const loadResult = (IRI: string): Action => {
    return {
        type: TYPES.loadResult,
        payload: IRI
    }
}

TYPES.createResource = 'CREATE_RESOURCE';
export const createResource = (IRI: string): Action => {
    return {
        type: TYPES.createResource,
        payload: IRI
    }
}

export type LoadedResourceAction = {
    type: string,
    payload: {
        IRI: string,
        individual: Individual,
        assocResources?:{}
    }
}
TYPES.loadedResource = 'LOADED_RESOURCE';
export const loadedResource = (IRI: string, individual: Individual,assocResources:{}): LoadedResourceAction => {
    return {
        type: TYPES.loadedResource,
        payload: {
            IRI,
            individual,
            assocResources
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
TYPES.hostError = 'HOST_ERROR';
export const hostError = (IRI: string, error: string): ResourceFailedAction => {
    return {
        type: TYPES.hostError,
        payload: {
            IRI,
            error
        }
    }
}

export type OntologyAction = {
    type: string,
    payload: Ontology
}
TYPES.loadedOntology = 'LOADED_ONTOLOGY';
export const loadedOntology = (ontology: Ontology): OntologyAction => {
    return {
        type: TYPES.loadedOntology,
        payload: ontology
    }
}


export type FoundResultsAction = {
    type: string,
    payload: {
        key: string,
        results: []
    }
}
TYPES.foundResults = 'FOUND_RESULTS';
export const foundResults = (key: string, results: []): FoundResultsAction => {
    return {
        type: TYPES.foundResults,
        payload: {
            key,
            results
        }
    }
}
