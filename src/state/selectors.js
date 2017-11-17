import type { AppState} from './reducers';
import * as ui from './ui/selectors';
import * as data from './data/selectors';

// Convert local selectors to global ones that accept an AppState object
const globalize = (selectors: {}, stateKey: string) => {
    let exportObject = {};
    for (let selector of Object.keys(selectors)) {
        exportObject[selector] = (state: AppState, ...args) => {
            return selectors[selector](state[stateKey], ...args);
        }
    }
    return exportObject;
}

let selectors = {
    ...globalize(ui, 'ui'),
    ...globalize(data, 'data')
}
export default selectors;