import type { DataState } from './reducers';
import Individual from 'lib/Individual';
import Ontology from 'lib/Ontology';

export const getResource = (state: DataState, IRI: string): ?Individual => {
    return state.resources[IRI];
}

export const getResourceError = (state: DataState, IRI: string): ?string => {
    return state.failures[IRI];
}

export const isResourceLoading = (state: DataState, IRI: string): boolean => {
    return (state.loading[IRI]) ? true : false;
}

export const getOntology = (state: DataState): Ontology => {
    return state.ontology;
}

export const getResults = (state: DataState, IRI: string): [] => {
    return state.resources[IRI];
}

export const getConfig = (state: DataState): [] => {
    return state.config;
}

export const getAssocResources = (state: DataState): [] => {
    return state.assocResources;
}
