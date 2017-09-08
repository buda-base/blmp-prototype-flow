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

    serialize(individual: Individual, baseURI, namespaces={}, addTypes=false) {
        let store = new rdf.graph();
        this._addTypes = addTypes;
        this.addIndividualToStore(individual, store);

        return new Promise((resolve, reject) => {
            try {
                // This is adapted from serialize.js
                // We can't use that as we have to call suggestPrefix to set
                // our preferred prefixes.
                let serializer = rdf.Serializer(store);
                serializer.defaultNamespace = baseURI;

                // We need to wrap stringToN3 as there is no API
                // to set what encoding flags it should use.
                let stringToN3 = serializer.__proto__.stringToN3;
                serializer.__proto__.stringToN3 = function(str) {
                    // Force displaying as unicode.
                    // Use anything other than 'e' as a flag.
                    return stringToN3(str, 'a');
                };
                let storeStatements = store.statementsMatching(undefined, undefined, undefined, undefined);
                for (let prefix in namespaces) {
                  serializer.suggestPrefix(prefix, namespaces[prefix]);
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
        if (individual.id && !individual.hasGeneratedId) {
            mainNode = rdf.sym(individual.id);
        } else {
            mainNode = rdf.blankNode(individual.id);
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
                    if (value.id && !value._hasGeneratedId) {
                        if (value.id.indexOf(':' !== -1)) {
                            valueNode = rdf.sym(value.id);
                        }
                    } else {
                        valueNode = rdf.blankNode(value.id);
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