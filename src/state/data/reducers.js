// @flow
import type { Action } from 'state/actions';
import createReducer from 'lib/createReducer';
import * as actions from './actions';
import type { OntologyAction } from './actions';
import Individual from 'lib/Individual';
import Ontology from '../../lib/Ontology';
import Serializer from '../../lib/Serializer';


export type DataState = {
    loading: {[string]: boolean},
    failures: {[string]: string},
    resources: {[IRI:string]: Individual},
    ontology: Ontology | null
    //graphText:string | null
}

const DEFAULT_STATE: DataState = {
    loading: {},
    failures: {},
    resources: {},
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


export const loadedResource = (state: DataState, action: actions.LoadedResourceAction) => {
    state = loading(state, actions.loading(action.payload.IRI, false));

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

         let indiv = new Individual("http://purl.bdrc.io/resource/"+action.payload) ;

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

export const loadedOntology = (state: DataState, action: OntologyAction) => {
    return {
        ...state,
        ontology: action.payload
    }
}
reducers[actions.TYPES.loadedOntology] = loadedOntology;

// Data Reducer
const reducer = createReducer(DEFAULT_STATE, reducers);
export default reducer;
