import type { DataState } from './reducers';
import Individual from 'lib/Individual';

export const getResource = (state: DataState, IRI: string): ?Individual => {
    return state.resources[IRI];
}