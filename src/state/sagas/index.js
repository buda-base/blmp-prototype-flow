import { call, put, takeLatest, select, all } from 'redux-saga/effects';
import { INITIATE_APP } from 'state/actions';
import * as dataActions from 'state/data/actions';
import * as uiActions from 'state/ui/actions';
import selectors from 'state/selectors';
import bdrcApi from 'api/api';

const api = new bdrcApi();

function* initiateApp() {
    try {
        const ontology = yield call([api, api.getOntology]);
        yield put(dataActions.loadedOntology(ontology));
        yield put(uiActions.newTab());
    } catch(e) {
        console.log('initiateApp error: %o', e);
        // TODO: add action for initiation failure
    }
} 

function* watchInitiateApp() {
    yield takeLatest(INITIATE_APP, initiateApp);
}

/* Temporarily auto-load resource.
   Using this just so the UI is usable while waiting for the resource selector
   to be added for new/blank tabs.
*/
function* loadDefaultResource() {
    const resourceIRI = 'http://purl.bdrc.io/resource/G844';
    yield put(uiActions.editingResource(1, resourceIRI));
    yield call(loadResource, resourceIRI);
}

function* watchNewTab() {
    yield takeLatest(uiActions.TYPES.newTab, loadDefaultResource);
}
/* END Temporarily auto-load resource */

export function* loadResource(IRI) {
    yield put(dataActions.loading(IRI, true));
    try {
        const individual = yield call([api, api.getResource], IRI);
        yield put(dataActions.loadedResource(IRI, individual));
    } catch(e) {
        yield put(dataActions.resourceFailed(IRI, e.message));
        yield put(dataActions.loading(IRI, false));
    }
}

export function* watchLoadResource() {
    yield takeLatest(
        dataActions.TYPES.loadResource, 
        (action) => loadResource(action.payload)
    );
}

export function* selectedResource(action) {
    const resourceIRI = action.payload;
    const resource = yield select(selectors.getResource, resourceIRI);
    const loadingResource = yield select(selectors.isResourceLoading, resourceIRI);
    if (resourceIRI && !resource && !loadingResource) {
        yield loadResource(resourceIRI);
    }
}

export function* watchSelectedResource() {
    yield takeLatest(uiActions.TYPES.selectedResourceIRI, selectedResource);
}

export function* watchFindResource() {
    yield takeLatest(
        uiActions.TYPES.findResource,
        (action) => loadResource(action.payload)
    );
}

/** Root **/

export default function* rootSaga() {
    yield all([
        watchInitiateApp(),
        watchLoadResource(),
        watchSelectedResource(),
        watchFindResource(),
        watchNewTab()
    ])
}