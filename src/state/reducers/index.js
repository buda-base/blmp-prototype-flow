import { combineReducers } from 'redux';
import uiReducer from 'state/reducers/ui';

const rootReducer = combineReducers({
    ui: uiReducer
});

export default rootReducer;