import { createAction } from 'redux-actions';
import type { Action } from 'state/actions';
import Individual from 'lib/Individual';
import RDFProperty from 'lib/RDFProperty';

export const TYPES = {};

TYPES.selectedResourceIRI = 'SELECT_RESOURCE_IRI';
export const selectedResourceIRI = createAction(TYPES.selectedResourceIRI, IRI => IRI);


export type AddingResource = {
    individual: Individual,
    property: RDFProperty
}
export type AddingResourceAction = {
    type: string,
    payload: AddingResource
}
TYPES.addingResource = 'ADDING_RESOURCE';
export const addingResource = (individual: Individual, property: RDFProperty): AddingResourceAction => {
    return {
        type: TYPES.addingResource,
        payload: {
            individual: individual,
            property: property
        }
    }
}

TYPES.cancelAddingResource = 'CANCEL_ADDING_RESOURCE';
export const cancelAddingResource = createAction(TYPES.cancelAddingResource);