import * as rdf from 'rdflib';
import { IndexedFormula, Namespace, BlankNode } from 'rdflib';
import Individual from './Individual';
import Literal from './Literal';

const RDF  = Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');

const TYPE = RDF('type');

export default class Serializer {
    constructor() {

    }

    serialize(individual: Individual) {
        let store = new rdf.graph();

        this.addIndividualToStore(individual, store);

        return new Promise((resolve, reject) => {
            rdf.serialize(undefined, store, 'BASE', 'text/turtle', function(err, str) {
                if (err) {
                    reject(err);
                } else {
                    resolve(str);
                }
            });
        });
    }

    addIndividualToStore(individual: Individual, store: IndexedFormula) {
        let mainNode;
        if (individual.id) {
            mainNode = rdf.sym(individual.id);
        } else {
            mainNode = rdf.blankNode();
        }

        if (individual.types) {
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