// @flow
import type { Action } from 'state/actions';
import {directoryPrefixes} from 'api/api';
import store from 'index';
import createReducer from 'lib/createReducer';
import * as actions from './actions';
import type { OntologyAction } from './actions';
import Individual from 'lib/Individual';
import Ontology from '../../lib/Ontology';
import Serializer from '../../lib/Serializer';


export type DataState = {
    cookies?: {},
    loading: {[string]: boolean},
    failures: {[string]: string},
    resources: {[IRI:string]: Individual},
    ontology: Ontology | null,
    assocResources:{[string]:{}}
    //graphText:string | null
}

const DEFAULT_STATE: DataState = {
    loading: {},
    failures: {},
    resources: {},
    assocResources: {},
    ontology: null,
    //graphText:null
}

let reducers = {};

export const loading = (state: DataState, action: actions.LoadingAction) => {
    return {
        ...state,
        loading: {
            ...state.loading,
            [action.payload.id]: action.payload.isLoading
        }
    }
}
reducers[actions.TYPES.loading] = loading;


/*
export const assocResources = (state: DataState, action: Action) => {

let assocResources = state.assocResources
if(!assocResources) assocResources = {}
assocResources = {...assocResources, ...action.meta }

    return {
        ...state,
        assocResources
    }
}
reducers[actions.TYPES.assocResources] = assocResources;
*/

export const loadedResource = (state: DataState, action: actions.LoadedResourceAction) => {
    state = loading(state, actions.loading(action.payload.IRI, false));


    let assocResources = state.assocResources
    if(!assocResources) assocResources = {}
    assocResources = {...assocResources, ...action.payload.assocResources }


    /*
    // no need to do anything more in actions finally
    //(cf TabContent.graphTextIRI)
    let serializer = new Serializer();
    const baseURI = 'http://purl.bdrc.io/ontology/core/';
    let indiv = action.payload.individual
    let graphT ;
    let txt = serializer.serialize(indiv, baseURI, indiv.namespaces)
    .then((str) => { return str; })
     */

      return {
      ...state,
      assocResources,

      /*
      graph:{
         ...state.graph,
         [action.payload.IRI]:txt
      },
      */

      resources: {
            ...state.resources,
            [action.payload.IRI]: action.payload.individual
      }
   }
}
reducers[actions.TYPES.loadedResource] = loadedResource;

export const createResource = (state: DataState, action: actions.LoadedResourceAction) => {

         console.log("dbg",action)

         let indiv = new Individual("http://purl.bdrc.io/resource/"+action.payload) ;
         let prefix = action.payload.replace(/^([A-Z]+)[^A-Z]*$/,"$1")
         let p = directoryPrefixes[prefix].replace(/s$/,"")
         p = "http://purl.bdrc.io/ontology/core/"+ p[0].toUpperCase() + p.substring(1)
         indiv._types.push(p)

         //console.log("indiv",indiv);

         indiv.addDefaultProperties(store.getState().data.ontology._classes[p],true)

        //console.log("indivAdd",indiv);

      return {
      ...state,

      resources: {
            ...state.resources,
            [action.payload]: indiv,
            ["http://purl.bdrc.io/resource/"+action.payload]: indiv,
      }
   }
}
reducers[actions.TYPES.createResource] = createResource;


export const foundResults = (state: DataState, action: actions.FoundResultsAction) => {

      return {
      ...state,

      resources: {
            ...state.resources,
            [action.payload.key]: action.payload.results
            }
   }
}
reducers[actions.TYPES.foundResults] = foundResults;



export const resourceFailed = (state: DataState, action: actions.ResourceFailedAction) => {
    state = loading(state, actions.loading(action.payload.IRI, false));
    return {
        ...state,
        failures: {
            ...state.failures,
            [action.payload.IRI]: action.payload.error
        }
    }
}
reducers[actions.TYPES.resourceFailed] = resourceFailed;

export const hostError = (state: DataState, action: actions.ResourceFailedAction) => {
    return {
        ...state,
        failures: {
            ...state.failures,
            host: action.payload.error
        }
    }
}
reducers[actions.TYPES.hostError] = hostError;

export const loadedOntology = (state: DataState, action: OntologyAction) => {
    return {
        ...state,
        ontology: action.payload
    }
}
reducers[actions.TYPES.loadedOntology] = loadedOntology;

export const weHaveCookies = (state: DataState, action: Action) => {
    return {
        ...state,
        cookies: action.payload
    }
}
reducers[actions.TYPES.weHaveCookies] = weHaveCookies;

export const loadedConfig = (state: DataState, action: Action) => {
    return {
        ...state,
        config: action.payload
    }
}
reducers[actions.TYPES.loadedConfig] = loadedConfig;

export const chosenHost = (state: DataState, action: Action) => {

   //console.log("ol'state",state)

   let endpoints = state.config.ldspdi.endpoints
   let idx = endpoints.indexOf(action.payload) ;
   if(idx === -1) endpoints.push(action.payload);
   idx = endpoints.indexOf(action.payload) ;

   let config = {
      ...state.config,
      ldspdi:
      {
         endpoints,
         index:idx
      }
   };

    state = {
        ...state,
        config,
        failures: {
            ...state.failures,
            host: null
        }
    }

    state.cookies.set("config",config)

    // console.log("state",state)
    return state ;
}
reducers[actions.TYPES.chosenHost] = chosenHost;

// Data Reducer
const reducer = createReducer(DEFAULT_STATE, reducers);
export default reducer;
