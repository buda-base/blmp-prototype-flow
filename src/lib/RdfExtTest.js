// @flow
import * as rdf from 'rdflib';
import rdfext from 'rdf-ext';
import jsonldParser from 'rdf-parser-jsonld';
import n3Serializer from 'rdf-serializer-ntriples';
import rdfDataset from 'rdf-store-dataset';
import stringToStream from 'string-to-stream';
import { Namespace, NamedNode, BlankNode, Literal as LiteralNode } from 'rdflib';
import Ontology from './Ontology'

const RDF  = Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
const TYPE = RDF('type');

export default class RdfExtTest {
    _ontology: Ontology;
    _store: rdf.IndexedFormula;

    static create(data: string, baseIRI: string, mimeType: string, ontology: Ontology): Promise<RdfExtTest> {
        return new Promise((resolve, reject) => {
            new RdfExtTest(data, baseIRI, mimeType, ontology, (graph, error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(graph);
                }
            });
        });
    }

    constructor(data: string, baseIRI: string, mimeType: string, ontology: Ontology,
                onReady: (graph: RdfExtTest, error: string) => void) {
        this._ontology = ontology;
        this._store = rdf.graph();
        rdf.parse(data, this._store, baseIRI, mimeType, (error, store) => {
            if (!error) {
                this.init();
            }
            onReady(this, error);
        });


        let parser = new jsonldParser({factory: rdf});
        let quadStream = parser.import(stringToStream(data));
        // let dataset = new rdfDataset();
        let dataset;
        // let res = dataset.import(quadStream);
        rdfext.dataset().import(quadStream).then((newDataset) => {
            dataset = newDataset;
            console.log('dataset: %o', dataset);
        });

        let serializer = new n3Serializer();
        let nTriplesStream = serializer.import(quadStream);
        let triples = '';
        nTriplesStream.on('data', (chunk) => triples += chunk);
        nTriplesStream.on('end', () => console.log('triples: %s', triples));
        console.log('nTriplesStream: %o', nTriplesStream);
    }

    init() {

    }
}