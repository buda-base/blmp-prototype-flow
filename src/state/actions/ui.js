import { createAction } from 'redux-actions';

export const selectedResource = createAction('SELECT_RESOURCE', id => id);