// @flow
import * as rdf from 'rdflib';
import { IndexedFormula, Namespace, Node, NamedNode, Statement } from 'rdflib';
import {BlankNode} from 'rdflib';

const RDF  = Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
const RDFS = Namespace('http://www.w3.org/2000/01/rdf-schema#');
const OWL  = Namespace('http://www.w3.org/2002/07/owl#');
const BDRC = Namespace('http://purl.bdrc.io/ontology/');
const BDRC_ROOT = Namespace('http://purl.bdrc.io/ontology/root#');

const TYPE = RDF('type');
const CLASS = OWL('Class');
const SUBCLASS_OF = RDFS('subClassOf');
const SUBPROPERTY_OF = RDFS('subPropertyOf');
const RANGE = RDFS('range');
const DOMAIN = RDFS('domain');
const DATATYPE_PROPERTY = OWL('DatatypeProperty');
const OBJECT_PROPERTY = OWL('ObjectProperty');
const ANNOTATION_PROPERTY = OWL('AnnotationProperty');
const UNION_OF = OWL('unionOf');

type PropertyData = {
    domains: string[];
    ranges: string[];
}

export default class Ontology {
    _store: IndexedFormula;
    _classes = {};
    _properties = {};

    static create(data: string, baseIRI: string, mimeType: string): Promise<Ontology> {
        return new Promise((resolve, reject) => {
            new Ontology(data, baseIRI, mimeType, (ontology, error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(ontology);
                }
            });
        });
    }

    constructor(data: string, baseIRI: string, mimeType: string,
                onReady: (ontology: Ontology, error: string) => void) {

        this._store = rdf.graph();
        rdf.parse(data, this._store, baseIRI, mimeType, (error, store) => {
            if (!error) {
                this.init();
            }
            onReady(this, error);
        });
    }

    init() {
        const datatypeProps = this.addPropertyType(
            DATATYPE_PROPERTY.value,
            this.getProperties(DATATYPE_PROPERTY)
        );
        const objectProperties = this.addPropertyType(
            OBJECT_PROPERTY.value,
            this.getProperties(OBJECT_PROPERTY)
        );
        const annotationProperties = this.addPropertyType(
            ANNOTATION_PROPERTY.value,
            this.getProperties(ANNOTATION_PROPERTY)
        );
        this._properties = {
            ...datatypeProps,
            ...objectProperties,
            ...annotationProperties
        };

        this.processInverseOf();
        this.generatePropertyChildren(this._properties);
    }

    addPropertyType(type: string, properties: {}): {} {
        for (let prop in properties) {
            if (properties.hasOwnProperty(prop)) {
                properties[prop].propertyType = type;
            }
        }
        return properties;
    }

    generatePropertyChildren(properties: {}) {
        for (let propertyIRI in properties) {
            if (properties.hasOwnProperty(propertyIRI)) {
                const property = properties[propertyIRI];
                if (property.parent && properties[property.parent]) {
                    const parent = properties[property.parent];
                    if (!parent.children) {
                        parent.children = {};
                    }
                    parent.children[propertyIRI] = property;
                }
            }
        }
    }

    getStatements(subject?: NamedNode, predicate?: NamedNode, object?: NamedNode) {
        return this._store.statementsMatching(subject, predicate, object);
    }

    getClasses() {
        let classes = [];
        Object.keys(this._classes).forEach(function (classIRI) {
          classes.push(classIRI);
        });
        return classes;
    }

    getClassProperties(iri: string): {}[] {
        let properties = [];
        const availableProperties = this._classes[iri];
        if (!availableProperties) {
            return properties;
        }

        const rangeKey = 'ranges';
        for (let availableProperty of availableProperties) {
            let propertyData = this._properties[availableProperty];
            if (propertyData) {
                let property = {
                    ...propertyData,
                    name: availableProperty
                };

                properties.push(property);
            }
        }

        return properties;
    }

    getPropertyRanges(iri: string): string {
        const typeData = this._properties[iri];
        return typeData['ranges'];
    }

    getProperties(propertyType: NamedNode): {} {
        const propsStatements = this.getStatements(undefined, TYPE, propertyType);
        let props = {};
        for (let property of propsStatements) {
            props[property.subject.value] = {};
            props[property.subject.value].domains = this.getDomains(property.subject);
            props[property.subject.value].ranges = this.getRanges(property.subject);
            props[property.subject.value].parent = this.getSuperproperty(property.subject);
        }

        return props;
    }

    processInverseOf() {
        const inverseStatements = this.getStatements(undefined, OWL('inverseOf'), undefined);
        for (let inverseOf of inverseStatements) {
            let subject = inverseOf.subject.value;
            let object = inverseOf.object.value;

            if (this.isProperty(subject) && this.isProperty(object)) {
                let subjectProperty = this._properties[subject];
                let objectProperty = this._properties[object];
                if (subjectProperty.ranges.length === 0 && objectProperty.ranges.length > 0) {
                    subjectProperty.ranges.push(objectProperty.ranges[0]);
                }
                if (subjectProperty.domains.length === 0 && objectProperty.domains.length > 0) {
                    subjectProperty.domains.push(objectProperty.domains[0]);
                }

                if (objectProperty.ranges.length === 0 && subjectProperty.ranges.length > 0) {
                    objectProperty.ranges.push(subjectProperty.ranges[0]);
                }
                if (objectProperty.domains.length === 0 && subjectProperty.domains.length > 0) {
                    objectProperty.domains.push(subjectProperty.domains[0]);
                }
            }
        }
    }

    getSuperclass(node: Node): ?string {
        let superclasses = this.getObjects(node, SUBCLASS_OF);

        if (superclasses.length > 1) {
            console.warn('more superclasses than expected for %o: %o', node, superclasses);
        }
        let validSuperclass;
        for (let superclass of superclasses) {
            if (superclass !== node.value) {
                validSuperclass = superclass;
                break;
            }
        }

        return validSuperclass;
    }

    getSuperproperty(node: Node): ?string {
        let superProperties = this.getObjects(node, SUBPROPERTY_OF);

        if (superProperties.length > 1) {
            console.warn('more superProperties than expected for %o: %o', node, superProperties);
        }
        let validSuperProperty;
        for (let superclass of superProperties) {
            if (superclass !== node.value) {
                validSuperProperty = superclass;
                break;
            }
        }

        return validSuperProperty;
    }

    getObjects(node: Node, property: Node): string[] {
        let statements = this.getStatements(node, property);

        let objects: string[] = [];
        for (let statement of statements) {
            objects.push(statement.object.value);
        }

        return objects;
    }

    getDomains(node: Node): string[] {
        let nodeDomains: string[] = [];
        const domains = this.getStatements(node, DOMAIN, undefined);
        for (let domain of domains) {
            nodeDomains = nodeDomains.concat(
                nodeDomains,
                this.getObjectValues(domain.object)
            );
        }

        let superclass = this.getSuperclass(node);
        if (superclass) {
            nodeDomains = nodeDomains.concat(this.getDomains(superclass));
        }

        let superProperty = this.getSuperproperty(node);
        if (superProperty) {
            let superPropertyDomains = this.getDomains(new NamedNode(superProperty));
            nodeDomains = nodeDomains.concat(superPropertyDomains);
        }

        for (let domain of nodeDomains) {
            this.addPropertyToClass(node.value, domain);
        }

        return nodeDomains;
    }

    getRanges(node: Node): string[] {
        let ranges: string[] = [];
        const nodeRanges = this.getStatements(node, RANGE, undefined);
        for (let range of nodeRanges) {
            ranges = ranges.concat(
                ranges,
                this.getObjectValues(range.object)
            );
        }

        let superclass = this.getSuperclass(node);
        if (superclass) {
            ranges = ranges.concat(this.getRanges(superclass));
        }

        let superProperty = this.getSuperproperty(node);
        if (superProperty) {
            let superPropertyRanges = this.getRanges(new NamedNode(superProperty));
            ranges = ranges.concat(superPropertyRanges);
        }

        // get any more ranges in store properties
        if (this._properties[node.value]) {
            for (let range of this._properties[node.value].ranges) {
                if (ranges.indexOf(range) === -1) {
                    ranges.push(range);
                }
            }
        }

        return ranges;
    }

    getObjectValues(object: Node): string[] {
        let values: string[] = [];
        if (object instanceof BlankNode) {
            let unions = this.getStatements(object, UNION_OF, undefined);
            for (let union of unions) {
                if (union.object.hasOwnProperty('elements')) {
                    for (let element of union.object.elements) {
                        values.push(element.value);
                    }
                }
            }
        } else {
            values.push(object.value);
        }

        return values;
    }

    addPropertyToClass(propertyIRI: string, classIRI: string) {
        if (this._classes[classIRI] === undefined) {
            this._classes[classIRI] = [];
        }
        // There should only be a single instance of each propertyIRI
        // associated with a classIRI.
        if (this._classes[classIRI].indexOf(propertyIRI) === -1) {
            this._classes[classIRI].push(propertyIRI);
        }
    }

    isProperty(IRI: string): boolean {
        return this._properties.hasOwnProperty(IRI);
    }

    isClass(IRI: string): boolean {
        return this._classes.hasOwnProperty(IRI);
    }

    resourceMatchesRange(resourceIRI: string, rangeIRI: string) {

    }
}