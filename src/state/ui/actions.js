import { createAction } from 'redux-actions';
import type { Action } from 'state/actions';

export const TYPES = {};

TYPES.selectedResourceIRI = 'SELECT_RESOURCE_IRI';
export const selectedResourceIRI = createAction(TYPES.selectedResourceIRI, IRI => IRI);