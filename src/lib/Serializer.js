import * as rdf from 'rdflib';
import { IndexedFormula, Namespace, BlankNode } from 'rdflib';
import Individual from './Individual';
import Literal from './Literal';

const RDF  = Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');

const TYPE = RDF('type');

export default class Serializer {
    _addTypes: boolean;

    constructor() {

    }

    serialize(individual: Individual, addTypes=false) {
        let store = new rdf.graph();
        this._addTypes = addTypes;
        this.addIndividualToStore(individual, store);

        const prefixes = {
            'adm': 'http://purl.bdrc.io/ontology/admin/',
            'xsd': 'http://www.w3.org/2001/XMLSchema#',
            'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
            'bdr': 'http://purl.bdrc.io/resource/'
        };

        return new Promise((resolve, reject) => {
            try {
                // This is adapted from serialize.js
                // We can't use that as we have to call suggestPrefix to set
                // our preferred prefixes.
                let serializer = rdf.Serializer(store);
                let storeStatements = store.statementsMatching(undefined, undefined, undefined, undefined);
                serializer.suggestNamespaces(store.namespaces);
                for (let prefix in prefixes) {
                  serializer.suggestPrefix(prefix, prefixes[prefix]);
                }
                serializer.setFlags('si'); // Suppress = for sameAs and => for implies
                let documentString = serializer.statementsToN3(storeStatements);
                resolve(documentString);
            } catch (e) {
                reject(e);
            }
        });
    }

    addIndividualToStore(individual: Individual, store: IndexedFormula) {
        let mainNode;
        if (individual.id) {
            mainNode = rdf.sym(individual.id);
        } else {
            mainNode = rdf.blankNode();
        }

        if (this._addTypes && individual.types) {
            for (let type of individual.types) {
                store.add(mainNode, TYPE, rdf.sym(type));
            }
        }

        let properties = individual.getProperties();
        for (let propertyIRI in properties) {
            const propertyNode = rdf.sym(propertyIRI);
            let values = properties[propertyIRI];
            for (let value of values) {
                let valueNode;
                if (value instanceof Individual) {
                    if (value.id) {
                        if (value.id.indexOf(':' !== -1)) {
                            valueNode = rdf.sym(value.id);
                        }
                    } else {
                        valueNode = rdf.blankNode();
                    }
                    this.addIndividualToStore(value, store);
                } else if (value instanceof Literal) {
                    let type;
                    if (value.type) {
                        type = rdf.sym(value.type);
                    }
                    try {
                        valueNode = store.literal(value.value, value.language, type);
                    } catch(e) {
                        console.log('error parsing literal: %o, error: %e', value, e);
                    }

                }
                try {
                    store.add(mainNode, propertyNode, valueNode);
                } catch(e) {
                    console.log('error adding valueNode: %o', valueNode);
                }

            }
        }
    }
}