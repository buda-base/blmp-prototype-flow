import { call, put, takeLatest, select, all } from 'redux-saga/effects'
import * as dataActions from 'state/data/actions';
import * as uiActions from 'state/ui/actions';
import selectors from 'state/selectors';
import bdrcApi from 'api/api';

const api = new bdrcApi();

export function* loadResource(IRI) {
    yield put(dataActions.loading(IRI, true));
    try {
        const individual = yield call([api, api.getResource], IRI);
        yield put(dataActions.loadedResource(IRI, individual));
    } catch(e) {
        console.log('error in loadResource: %o', e);
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

/** Root **/

export default function* rootSaga() {
    yield all([
        watchLoadResource(),
        watchSelectedResource(),
    ])
}