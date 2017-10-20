import type { DataState } from './reducers';
import Individual from 'lib/Individual';

export const getResource = (state: DataState, IRI: string): ?Individual => {
    return state.resources[IRI];
}

export const isResourceLoading = (state: DataState, IRI: string): boolean => {
    return (state.loading[IRI]) ? true : false;
}