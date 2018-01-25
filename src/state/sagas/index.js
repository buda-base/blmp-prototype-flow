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

function* watchEditingResource() {
    yield takeLatest(uiActions.TYPES.editingResource, selectedResource);
}

export function* loadResource(IRI) {

   console.log("watchLoad");

    yield put(dataActions.loading(IRI, true));
    try {
        const individual = yield call([api, api.getResource], IRI);
        yield put(dataActions.loadedResource(IRI, individual));
        // IRI might only be the resource ID so make sure the
        // actual IRI is set as well.
        if (individual.id !== IRI) {
            yield put(dataActions.loadedResource(individual.id, individual));
        }
    } catch(e) {
        yield put(dataActions.resourceFailed(IRI, e.message));
        yield put(dataActions.loading(IRI, false));
    }
}

export function* watchLoadResource() {

   console.log("watchLoad*");

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
        watchEditingResource()
    ])
}
