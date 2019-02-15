import Auth from 'Auth/Auth';
import { call, put, takeLatest, select, all } from 'redux-saga/effects';
import { INITIATE_APP } from 'state/actions';
import * as dataActions from 'state/data/actions';
import * as uiActions from 'state/ui/actions';
import selectors from 'state/selectors';
import bdrcApi from 'api/api';
import store from 'index';
import {auth} from '../../routes';
import populateDB from "offline/populateDB"

const api = new bdrcApi();

function* initiateApp() {
   try {
      let cookies = store.getState().data.cookies ;
      let config ;
      if(cookies) config = cookies.get("config")

      if(!config || !cookies.auth) config = yield call([api, api.loadConfig]);
      auth.setConfig(config.auth)
      console.log("auth",auth)

      yield put(dataActions.loadedConfig(config));
      yield put(dataActions.choosingHost(config.ldspdi.endpoints[config.ldspdi.index]));

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

   // console.log("load");

   yield put(dataActions.loading(IRI, true));
   try {

      let assoR = {};
      let config = store.getState().data.config
      if(config.ldspdi && config.ldspdi.endpoints[config.ldspdi.index] !== "offline") {
         assoR = yield call([api, api.loadAssocResources], IRI);
      }
      //yield put(dataActions.assocResources(IRI, assoR.data));

      let individual = yield call([api, api.getResource], IRI);
      let onto = store.getState().data.ontology
      individual.addDefaultProperties(onto._classes[individual._types[0]],true)

      yield put(dataActions.loadedResource(IRI, individual,assoR.data));
      // IRI might only be the resource ID so make sure the
      // actual IRI is set as well.
      if (individual.id !== IRI) {
         yield put(dataActions.loadedResource(individual.id, individual,assoR.data));
      }


   } catch(e) {
      yield put(dataActions.resourceFailed(IRI, e.message));
      yield put(dataActions.loading(IRI, false));
   }
}

function* indexDBcheck(host:string)
{

   let config = store.getState().data.config
   console.log("ldspdi",config.ldspdi)
   if(config.ldspdi && config.ldspdi.endpoints[config.ldspdi.index] !== "offline")
   {
      if(window.confirm("[experimental feature]\nstart populating indexedDB from previous endpoint ?\n"+config.ldspdi.endpoints[config.ldspdi.index]))
      {
         alert("[experimental feature]\nplease wait until endpoint actually set to 'Offline'\n(this may take several minutes\nopen console/network to view progress)")
         yield put(dataActions.hostError("offline","offline endpoint"));
         populateDB(api);
      }
      else {
         yield put(dataActions.chosenHost(host));
         yield put(dataActions.hostError("offline","offline endpoint"));
      }
   }
   else {

      yield put(dataActions.chosenHost(host));
      yield put(dataActions.hostError(host,"offline endpoint"));
   }
}


function* fsAPIcheck(host:string)
{

   let config = store.getState().data.config
   console.log("ldspdi",config.ldspdi)
   if(config.ldspdi && config.ldspdi.endpoints[config.ldspdi.index] !== "offline")
   {
      let navig = window.navigator || navigator
      console.log("checked config",navig)

      if (navig.storage && navig.storage.persist)
      {

         console.log("checked storage")

         /* // check permanent-storage permission (Firefox only)
         window.navigator.permissions.query({name:'persistent-storage'}).then(function(permissionStatus) {
            console.log('persistent-storage permission status is ', permissionStatus.state);
         }).catch( (failure) => {
            console.error("permissions",failure,window.navigator.permissions);
         });
         */

         //v2
         async function isStoragePersisted() {
           return await navig.storage && navig.storage.persisted &&
               navig.storage.persisted();
         }

         isStoragePersisted().then(async isPersisted => {
           if (isPersisted) {
             console.log(":) Storage is successfully persisted.");
           } else {
             console.log(":( Storage is not persisted.");
             console.log("Trying to persist..:");
             if (await navig.storage.persist()) {
               console.log(":) We successfully turned the storage to be persisted.");
             } else {
               console.log(":( Failed to make storage persisted");
             }
           }
         })

         navig.storage.estimate().then(function(estimate) {
            console.log("quota="+estimate.usage+"/"+estimate.quota)

            // /!\ not supported in Firefox /!\
            window.webkitRequestFileSystem(window.PERSISTENT, 10*1024*1024*1024, (fs) => {
               console.log('Opened file system: ', fs);
            }, (error) => {
               console.error("FS error",error)
            });

         })

         /* //v1
         window.navigator.storage.persist().then(function(persistent) {
            console.log("storage",window.navigator.storage)
            if (persistent)
               console.log("Storage will not be cleared except by explicit user action");
            else
               console.log("Storage may be cleared by the UA under storage pressure.");
         }).catch( (failure) => {
            console.error("persist",failure);
         });
         */

      }


      yield put(dataActions.chosenHost(host));
      yield put(dataActions.hostError("offline","offline endpoint"));
   }
   else {

      yield put(dataActions.chosenHost(host));
      yield put(dataActions.hostError(host,"offline endpoint"));
   }
}



export function* chooseHost(host:string) {


   if(host === "offline") {

      //yield call(indexDBcheck, host);
      yield call(fsAPIcheck, host);
   }
   else {

      try
      {
         yield call([api, api.testHost], host);
         yield put(dataActions.chosenHost(host));
      }
      catch(e)
      {
         yield put(dataActions.chosenHost(host));
         yield put(dataActions.hostError(host,e.message));
      }
   }
}

export function* loadResult(IRI) {


   yield put(dataActions.loading(IRI, true));
   try {
      const individual = yield call([api, api.getResource], IRI);

      let onto = store.getState().data.ontology
      individual.addDefaultProperties(onto._classes[individual._types[0]],true)

      yield put(dataActions.loadedResource(IRI, individual));

      // IRI might only be the resource ID so make sure the
      // actual IRI is set as well.
      if (individual.id !== IRI) {
         yield put(dataActions.loadedResource(individual.id, individual));
         yield put(uiActions.editingResourceInNewTab(individual.id));
      }
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

export function* watchLoadResult() {

   yield takeLatest(
      dataActions.TYPES.loadResult,
      (action) => loadResult(action.payload)
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


export function* searchResource(key) {

   console.log("search",key);

   yield put(dataActions.loading(key, true));
   try {
      const result = yield call([api, api.getResults], key);
      yield put(dataActions.foundResults(key, result));

   } catch(e) {
      yield put(dataActions.resourceFailed(key, e.message));
      yield put(dataActions.loading(key, false));
   }
}

export function* watchSearchResource() {

   yield takeLatest(
      uiActions.TYPES.searchResource,
      (action) => searchResource(action.payload)
   );
}

export function* watchChoosingHost() {

   yield takeLatest(
      dataActions.TYPES.choosingHost,
      (action) => chooseHost(action.payload)
   );
}

/** Root **/

export default function* rootSaga() {
   yield all([
      watchInitiateApp(),
      watchLoadResource(),
      watchLoadResult(),
      watchSelectedResource(),
      watchFindResource(),
      watchSearchResource(),
      watchEditingResource(),
      watchChoosingHost()
   ])
}
