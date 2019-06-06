// @flow
// import md5 from 'md5';
import Graph from '../lib/Graph';
import Ontology from '../lib/Ontology';
import Individual from '../lib/Individual';
import store from '../index';
import * as idb from 'idb' ;

export const directoryPrefixes = {
    'C': 'corporations', //
    'UT': 'etexts',
    'I': 'items',
    'L': 'lineages',
    'R': 'offices',  //
    'P': 'persons',
    'G': 'places',
    'PR': 'products', //
    'T': 'topics',
    'W': 'works'
}

// const OBJECT_PATH = '/objects';
const ONTOLOGY_ADMIN_PATH = '/admin.ttl'
const ONTOLOGY_CORE_PATH = '/core.ttl'
const CONFIG_PATH = '/config.json'
const CONFIGDEFAULTS_PATH = '/config-defaults.json'
const ONTOLOGY_BASE_IRI = 'http://purl.bdrc.io/ontology/core/';
const BASE_IRI = 'http://purl.bdrc.io/resource/';
const TURTLE_MIME_TYPE = 'text/turtle' ;
const RDF_XML_MIME_TYPE = 'application/rdf+xml' ;
const JSON_LD_MIME_TYPE = 'application/ld+json' ;

export const REMOTE_ENTITIES = [
    "http://purl.bdrc.io/ontology/core/Corporation",
    "http://purl.bdrc.io/ontology/core/Item",
    "http://purl.bdrc.io/ontology/core/Lineage",
    "http://purl.bdrc.io/ontology/core/Person",
    "http://purl.bdrc.io/ontology/core/Place",
    "http://purl.bdrc.io/ontology/admin/Product",
    "http://purl.bdrc.io/ontology/core/Role",
    "http://purl.bdrc.io/ontology/core/User",
    "http://purl.bdrc.io/ontology/core/Work",
    "http://purl.bdrc.io/ontology/core/Topic",
    "http://purl.bdrc.io/ontology/core/Work"
]

export interface APIResponse {
    text(): Promise<string>
}

type APIOptions = {
    server?: string,
    fetch?: (req: string) => Promise<*>
}

export class ResourceNotFound extends Error {};

export class InvalidResource extends Error {};

export default class API {
    _server: string;
    _fetch: (req: string) => Promise<APIResponse>
    _ontology: Ontology;

    constructor(options: ?APIOptions) {
        if (options) {
            if (options.server) this._server = options.server;
            this._fetch = (options.fetch) ? options.fetch : window.fetch.bind(window);
        } else {
            this._fetch = window.fetch.bind(window);
        }
    }


    getAuthStr()
    {
       const access_token = localStorage.getItem('access_token');
       const id_token = localStorage.getItem('id_token');
       const expires_at = localStorage.getItem('expires_at');

       const param = { access_token, id_token, expires_at } ;

       const authStr = Object.keys(param).map( (k) => k+"="+param[k] ).join('&')

       return authStr ;

    }

    getSearchContents(url: string, key:string, param:{}={}): Promise<{}>
   {

      console.log("key",key);

      // let res = {}, text
      let text;
      param = { searchType:"BLMP",LG_NAME:"bo-x-ewts",I_LIM:500, ...param }
      if(key.indexOf("\"") === -1) key = "\""+key+"\""
      param["L_NAME"] = key ;
      url += "/"+param["searchType"];
      delete param["searchType"]

      console.log("query",key,url,param);

      // + this.getAuthStr() ...

      var formData = new FormData();
      for (var k in param) {
          formData.append(k, param[k]);
      }
      // (using formData directly as body doesn't seem to work...)
      let body = [...formData.entries()]
                     .map(e => encodeURIComponent(e[0]) + "=" + encodeURIComponent(e[1]))
                     .join('&')

      console.log("body",body);

        return new Promise((resolve, reject) => {

            this._fetch( url+"?"+body+"&format=json",
            {
              method: 'GET',
              headers:new Headers(
                 {
                    //"Content-Type": "application/x-www-form-urlencoded",
                    "Accept": "application/json"
                 })
           }).then((response) => {

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new ResourceNotFound('The search server '+url+' seem to have moved...');
                    }
                    else {
                       console.log("FETCH pb",response)
                        throw new ResourceNotFound('Problem fetching the results ['+response.message+']');
                    }
                }
                console.log("FETCH ok",url,response)

                response.text().then((req) => {

                     // console.log("req",req)

                    text = JSON.parse(req) //.results.bindings ;

                    // console.log("text",text)

                    if(text.length === 0) {
                       throw new InvalidResource('No results found');
                    }

                    resolve(text);
                }).catch((e) => {
                   reject(e);
               });
            }).catch((e) => {
                reject(e);
            });
        });
    }


    async loadConfig(): Promise<string>
    {
      try {
         let config =  JSON.parse(await this.getURLContents(this._configPath,false,false));
         console.log("config",config)
         return config ;
      }
      catch(e) {
         let config =  JSON.parse(await this.getURLContents(this._configDefaultsPath,false,false));
         console.log("config-defaults",config)
         return config ;
      }
   }

    testHost(host : string): Promise<string>
    {
      return new Promise((resolve, reject) =>
      {
         this._fetch(host+"").then((response) =>
         {
            if (response.ok)
            {
               console.log("response ok",host,response)
               resolve(true);
            }
            else
            {
               console.log("response",response)
               throw new Error("Connection to " +host+ " failed")
            }

         }).catch((e) =>
         {
            console.log("error",e)
            reject(e)
         })
      })
    }

   /*
    findLDSPDIhost(): Promise<string>
    {

      let url = new URLSearchParams(document.location.search).get("ldspdi")
      if(url)
      {
          if(!url.match(/^http:\/\//)) url = url.replace(/^([^A-Za-z.-]*)/,"http://")
          LDSPDI_HOST = url ;
          return url ; //urls.push(url)
      }
      else return new Promise((resolve, reject) =>
      {
         let urls = ["http://localhost:8080", "http://localhost:13280","http://buda1.bdrc.io:13280" ]
         // console.log(urls)
         for(let u of urls)
         {
            // console.log("testing",u)
            try
            {
                this._fetch(u+"/resource/P1").then((response) =>
                {
                     if (response.ok)
                     {
                        console.log("response ok",u,response)
                        LDSPDI_HOST = u ;
                        resolve(u);
                     }

                 })
            }
            catch(e)
            {
               console.log("failed access",u,e)
            }
         }
      })
      */

    getURLContents(url: string, minSize : boolean = true, usePost : boolean = true): Promise<string> {
        let text;

        return new Promise((resolve, reject) => {

            this._fetch( url  // +(!usePost?"":"?"+this.getAuthStr())
                  /*
               ,  {
               method: 'GET',
                // mode: 'no-cors',
                // cors:'true',
                headers: new Headers(
                   {"Content-Type": "application/turtle",
                    "Accept":"application/turtle"}
                     )
            }
*/
         ).then((response) => {

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new ResourceNotFound('The resource does not exist.');
                    }
                    else {
                       console.log("FETCH pb",response)
                        throw new ResourceNotFound('Problem fetching the resource');
                    }
                }
                console.log("FETCH ok",url,response)
                response.text().then((reqText) => {
                    text = reqText;

                     console.log("text",reqText.length)
                     //if(minSize && reqText.length <= 553) { throw new ResourceNotFound('The resource does not exist.'); }

                    resolve(text);
                }).catch((e) => {
                   reject(e);
               });
            }).catch((e) => {
                reject(e);
            });
        });
    }

    async getOntology(returnDataOnly:boolean=false): Promise<Ontology> {
        let ontologyData

        if (!this._ontology || returnDataOnly) {
            // load admin ontology
            ontologyData = await this.getURLContents(this._ontologyPath + ONTOLOGY_ADMIN_PATH,false,false);
            this._ontology = await this._processOntologyData(ontologyData);
            // load core ontology
            ontologyData = await this.getURLContents(this._ontologyPath + ONTOLOGY_CORE_PATH,false,false);
            this._ontology = await this._processOntologyData(ontologyData);
        }

        if(!returnDataOnly) return this._ontology;
        else return ontologyData ;
    }

   _assocResourcesPath(IRI:string): string {

       if(IRI.indexOf(':') === -1) IRI = "bdr:"+IRI

       let config = store.getState().data.config.ldspdi
       let url = config.endpoints[config.index] ;

        let path = url +  "/lib/allAssocResource?R_RES=" + IRI;

        return path;
   }

    get _ontologyPath(): string {
        
        // use this part to use the local ontolgy file
        /*
        let path = '';
        if (this._server) {
            path = this._server;
        }
        return path
        */

        // use this part to use the online ontolgy file
        
        let config = store.getState().data.config.ldspdi
        let url = config.endpoints[config.index] + "/ontology";
        return url
        
    }

    get _configPath(): string {
        let path = CONFIG_PATH;
        if (this._server) {
            path = this._server + '/' + CONFIG_PATH;
        }

        return path;
    }
    get _configDefaultsPath(): string {
        let path = CONFIGDEFAULTS_PATH;
        if (this._server) {
            path = this._server + '/' + CONFIGDEFAULTS_PATH;
        }

        return path;
    }

    async _processOntologyData(ontologyData: string): Promise<Ontology> {
        const mimeType = TURTLE_MIME_TYPE; 
        let ontology = await Ontology.create(
            ontologyData, ONTOLOGY_BASE_IRI, mimeType
        );

        return ontology;
    }

    /**
     * Return the full IRI for an object.
     *
     * e.g. if given G844, it would return http://purl.bdrc.io/resource/G844
     *
     * If id is already a valid IRI, that will be returned unchanged.
     */
    _getResourceIRI(id: string): string {
        if (id.indexOf("http://") !== -1) {
            return id;
        }

        return BASE_IRI + id;
    }

    /**
     * Return the resource id of an object.
     *
     * e.g. for http://purl.bdrc.io/resource/G844 it would return G844
     *
     * If id is not an IRI, it will be returned unchanged.
     */
    _getResourceId(id: string): string {
        if (id.indexOf("http://") === -1) {
            return id;
        }

        return id.substr(id.lastIndexOf('/') + 1);
    }

    _getResourceURL(objectId: string): string {
        const id = this._getResourceId(objectId);
        let firstChars = null;
        try {
            firstChars = id.match(/^([A-Z]{0,2})/)[0];
        } catch(e) {
            throw new InvalidResource('The resource does not start with valid characters.');
        }

        // let dir = directoryPrefixes[firstChars];
        /*console.log('dir',dir,firstChars);
        if (!dir) // || !id.match(/^([a-zA-Z0-9]{2,})+$/))
        {
            throw new InvalidResource('The resource does not contain only valid characters.')
            //else throw new InvalidResource('The resource does not contain enough valid characters.');
        }
        else*/
        if(id.match(/^([a-zA-Z])$/))
        {
            throw new InvalidResource('The resource has not enough valid characters.')
        }
        else if(!id.match(/^([a-zA-Z_0-9]{2,})+$/))
        {
             throw new InvalidResource('The resource does not contain only valid characters.')
        }


        // const checksum = md5(id);
        // const objectDir = checksum.substr(0, 2);



         // let url = [OBJECT_PATH, dir, objectDir, id].join('/') + '.ttl';
         // if(id.match(/^(([CR])|(PR(HD)?))[0-9]+/)) url = [OBJECT_PATH, dir, id].join('/') + '.ttl';



         // url = "http://buda1.bdrc.io:13280/resource/"+id ;
         // url = "http://localhost:8080/resource/"+id ;
         let config = store.getState().data.config.ldspdi
         let url = config.endpoints[config.index]+"/resource/"+id+".ttl" ;


//         console.log([OBJECT_PATH, dir, objectDir, id, url])

        if (this._server) {
            url = this._server + url;
        }
        return url;
    }



   async _getResultsData(key: string): Promise<[] | null> {
     try {
          // let url = "http://buda1.bdrc.io:13280/resource/templates" ; //this._getResourceURL(id);
          // let url = "http://localhost:8080/resource/templates" ; //this._getResourceURL(id);

          let config = store.getState().data.config.ldspdi
          let url = config.endpoints[config.index]+"/query/table" ;
          let data = this.getSearchContents(url, key);

         // console.log("_reData");

          // return resourceData;

          return data ;
     } catch(e) {
          throw e;
     }
 }
    async getResults(id: string): Promise<[] | null> {
        let data: [];

        // console.log("reData");

        try {
            data = await this._getResultsData(id)

            return data ;
        } catch(e) {
            throw e;
        }
     }

    async _getResourceData(id: string): Promise<string | null> {
        try {
            let resourceData
            let config = store.getState().data.config
            if(config && config.ldspdi && config.ldspdi.endpoints && config.ldspdi.endpoints[config.ldspdi.index] === "offline") {
               console.log("id",id)

               let db = await idb.openDb('blmp-db', 2)
               let tx = await db.transaction('objects', 'readwrite');
               let objects = await tx.objectStore('objects');
               let val = await objects.get((!id.match(/^http:/)?"http://purl.bdrc.io/resource/":"")+id)

               if(!val) throw new Error("offline resource not found ("+id+")")
               else resourceData = val ;
            }
            else {
               let url = this._getResourceURL(id);
               resourceData = this.getURLContents(url);
            }

           console.log("reData",resourceData);

            return resourceData;
        } catch(e) {
            throw e;
        }
    }

    async loadAssocResources(IRI:string): Promise<string>
    {
       let resource =  JSON.parse(await this.getURLContents(this._assocResourcesPath(IRI),false));
       console.log("assocResources",resource)
       return resource ;
    }

    async getResource(id: string): Promise<Individual | null> {
        let data: string;
        try {
            data = String(await this._getResourceData(id));
        } catch(e) {
            throw e;
        }

//         console.log("getRe");

        let ontology;
        try {
            ontology = await this.getOntology();
        } catch(e) {
            throw e;
        }

//         console.log("getOnto");

        let graph;
        try {
            graph = await Graph.create(data, BASE_IRI, TURTLE_MIME_TYPE, ontology);
//             console.log("attendu?")
        } catch(e) {
            throw e;
        }

//         console.log("getGra",this._getResourceIRI(id));
        Graph.current = this._getResourceIRI(id) ;
        Graph.individuAll = {}
//         console.log("?",Graph.current);
        const ind = graph.getIndividualWithId(this._getResourceIRI(id));
        Graph.current = null ;
        ind.namespaces = graph.namespaces;

//         console.log("ind",ind);


        return ind;
    }
}
