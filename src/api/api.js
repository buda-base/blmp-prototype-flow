// @flow
import md5 from 'md5';
import Graph from '../lib/Graph';
import Ontology from '../lib/Ontology';
import Individual from '../lib/Individual';

const directoryPrefixes = {
    'C': 'corporations',
    'UT': 'etexts',
    'I': 'items',
    'L': 'lineages',
    'R': 'offices',
    'P': 'persons',
    'G': 'places',
    'PR': 'products',
    'T': 'topics',
    'W': 'works'
}

const OBJECT_PATH = '/objects';
const ONTOLOGY_PATH = '/bdrc.owl'
const ONTOLOGY_BASE_IRI = 'http://purl.bdrc.io/ontology/core/';
const BASE_IRI = 'http://purl.bdrc.io/resource/';
const TURTLE_MIME_TYPE = 'text/turtle';

export interface APIResponse {
    text(): Promise<string>
}

type APIOptions = {
    server?: string,
    fetch?: (req: Request) => Promise<*>
}

export default class API {
    _server: string;
    _fetch: (req: Request) => Promise<APIResponse>
    _ontology: Ontology;

    constructor(options: ?APIOptions) {
        if (options) {
            if (options.server) this._server = options.server;
            this._fetch = (options.fetch) ? options.fetch : fetch;
        }
    }

    getURLContents(url: string): Promise<string> {
        const req = new Request(url);
        let text;
        return new Promise((resolve, reject) => {
            this._fetch(req).then((response) => {
                response.text().then((reqText) => {
                    text = reqText;
                    resolve(text);
                });
            });
        });
    }

    async getOntology(): Promise<Ontology> {
        if (!this._ontology) {
            let ontologyData = await this.getURLContents(ONTOLOGY_PATH);
            this._ontology = await this._processOntologyData(ontologyData);
        }
        
        return this._ontology;
    }

    async _processOntologyData(ontologyData: string): Promise<Ontology> {
        const mimeType = 'application/rdf+xml';
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
    
    _getObjectURL(objectId: string): string | null {
        const id = this._getResourceId(objectId);
        let firstChars = null;
        try {
            firstChars = id.match(/^([A-Z]{0,2})/)[0];
        } catch(e) {
            return null;
        }
    
        let dir = directoryPrefixes[firstChars];
        if (!dir) {
            return null;
        }
    
        const checksum = md5(id);
        const objectDir = checksum.substr(0, 2);
    
        let url = [OBJECT_PATH, dir, objectDir, id].join('/') + '.ttl';
        if (this._server) {
            url = this._server + url;
        }
        return url;
    }
    
    async _getObjectData(id: string): Promise<string | null> {
        const url = this._getObjectURL(id);
        if (url) {
            return this.getURLContents(url);
        } else {
            return null;
        }
    }

    
    async getObject(id: string): Promise<Individual | null> {
        let data: string;
        try {
            data = String(await this._getObjectData(id));
        } catch(e) {
            return null;
        }

        let ontology;
        try {
            ontology = await this.getOntology();
        } catch(e) {
            return null;
        }
        
        let graph;
        try {
            graph = await Graph.create(data, BASE_IRI, TURTLE_MIME_TYPE, ontology);
        } catch(e) {
            return null;
        }
    
        const ind = graph.getIndividualWithId(this._getResourceIRI(id));
        ind.namespaces = graph.namespaces;
        return ind;
    }
}

