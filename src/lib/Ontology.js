// @flow
import * as rdf from 'rdflib';
import { IndexedFormula, Namespace, Node, NamedNode, Statement } from 'rdflib';
import {BlankNode} from 'rdflib';
import RDFClass from './RDFClass';
import RDFProperty from './RDFProperty';
import type { RDFComment } from './RDFProperty';
import RDFComponents from '../components/RDF/rdf_components';
// import * as PlaceType from '../components/RDF/PlaceType';
import * as Type from '../components/RDF/Type';

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
const COMMENT = RDFS('comment');
const LABEL = RDFS('label');
export const DATATYPE_PROPERTY = OWL('DatatypeProperty');
export const OBJECT_PROPERTY = OWL('ObjectProperty');
export const ANNOTATION_PROPERTY = OWL('AnnotationProperty');
const UNION_OF = OWL('unionOf');
const INDIVIDUAL = OWL('NamedIndividual');

type PropertyData = {
    domains: string[];
    ranges: string[];
}

export default class Ontology {
    _store: IndexedFormula;
    _classes = {};
    _properties = {};
    // store annotation properties as they are available for all classes
    _annotationProperties = {};
    _individuals = {}

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
         console.groupCollapsed("init ontology");

        let dProps,oProps,aProps ;

        const datatypeProps = this.addPropertyType(
            DATATYPE_PROPERTY.value,
            dProps = this.getProperties(DATATYPE_PROPERTY)
        );
        const objectProperties = this.addPropertyType(
            OBJECT_PROPERTY.value,
            oProps = this.getProperties(OBJECT_PROPERTY)
        );
        const annotationProperties = this.addPropertyType(
            ANNOTATION_PROPERTY.value,
            aProps = this.getProperties(ANNOTATION_PROPERTY)
        );
        this._annotationProperties = annotationProperties;
        this._properties = {
            ...datatypeProps,
            ...objectProperties,
            ...annotationProperties
        };
        this._propertiesArray = {
            [DATATYPE_PROPERTY.value]: this.toPropertiesArray(datatypeProps),  //DATATYPE_PROPERTY),
            [OBJECT_PROPERTY.value]: this.toPropertiesArray(objectProperties), //this.getPropertiesArray(OBJECT_PROPERTY),
            [ANNOTATION_PROPERTY.value]: this.toPropertiesArray(annotationProperties) //this.getPropertiesArray(ANNOTATION_PROPERTY)
        };


        this.processInverseOf();
        this.extractClasses();
        this.extractIndividuals();

//          console.log(RDFComponents)


        console.log("dataP",datatypeProps);
        console.log("objP",objectProperties);
        console.log("annoP",annotationProperties);

        console.groupEnd();
    }

    addPropertyType(type: string, properties: {}): {} {
        for (let prop in properties) {
            if (properties.hasOwnProperty(prop)) {
                properties[prop].propertyType = type;
            }
        }
        return properties;
    }

    getStatements(subject?: NamedNode, predicate?: NamedNode, object?: NamedNode) {
        return this._store.statementsMatching(subject, predicate, object);
    }

    extractClasses() {
        let classes = this.getStatements(undefined, TYPE, CLASS);
        classes = classes.reduce((result, cur) => {
            this.addClass(cur.subject.value);
        }, []);



        // console.log("classes",this._classes);

        for(let i in this._classes)
        {
           let c = this._classes[i]

           let superC = []

           for(let j in c.superclasses)
           {
             let s = c.superclasses[j]

             // console.log("s",s)

             if(this._classes[s.IRI]) superC.push(this._classes[s.IRI])
             else superC.push(s)
           }

           c.superclasses = superC

        }

      console.log("classes",this._classes);

        classes = this._classes
        for(let c in classes)
        {
           if(classes[c].hasAncestorclass("http://purl.bdrc.io/ontology/core/Facet",false))
           {
             // console.log("isok",c)
             let sup  = classes[c].superclasses.filter(superclass => superclass.hasSuperclass("http://purl.bdrc.io/ontology/core/Facet"))
             //console.log("sup",sup,classes[c],sup.addValue)
             sup[0].addSubclass(classes[c])
           }
        }

       console.log("classes",classes)

    }

    extractIndividuals() {
        let indiv = this.getStatements(undefined, TYPE, INDIVIDUAL);

        indiv = indiv.reduce((result, cur) => {

           let tmp = this.getStatements(cur.subject,TYPE);
//            console.log(tmp[1].object.value);
//            console.log(this._classes[tmp[1].object.value])
           if(this._classes[tmp[1].object.value].hasSuperclass("http://purl.bdrc.io/ontology/core/Type"))
           {
               this._classes[tmp[1].object.value].addValue(cur.subject.value)
               RDFComponents[tmp[1].object.value]=Type.default;
           }
           /*
           else {

            console.log("not a type",cur.subject.value,tmp[1].object.value);

            }
            */

            this._individuals[cur.subject.value] = cur.subject;

        }, []);

        // console.log("RDFcomps",RDFComponents)

    }

    getClasses() {
        let classes = [];
        Object.keys(this._classes).forEach(function (classIRI) {
          classes.push(classIRI);
        });
        return classes;
    }

    getClassProperties(iri: string): RDFProperty[] {
        let properties = [] ; //this._properties; //[];
        let rdfClass = this._classes[iri];

//         console.log("classes",this._classes);
//         console.log("properties",this._properties);

        if (!rdfClass) {
            return properties;
        }
        properties = rdfClass.properties;

        return properties;
    }

    get annotationProperties(): {} {
        return this._annotationProperties;
    }

    getPropertyRanges(iri: string): string {
        const typeData = this._properties[iri];
        return typeData['ranges'];
    }

    getPropertiesArray(propertyType: NamedNode): RDFProperty[] {
       const obj = this.getProperties(propertyType);
       let ret = []
       for (let k of Object.keys(obj)) ret.push(obj[k]) ;
       return ret ;
    }

    toPropertiesArray(obj: NamedNode): RDFProperty[] {
       let ret = []
       for (let k of Object.keys(obj)) ret.push(obj[k]) ;
       return ret ;
    }

    getProperties(propertyType: NamedNode): {} {
        const propsStatements = this.getStatements(undefined, TYPE, propertyType);
        let props = {};

//         console.groupCollapsed("onto props",propertyType)

        for (let property of propsStatements) {
            let prop = this._properties[property.subject.value];
            if (!prop) {
                prop = new RDFProperty(property.subject.value);
                this._properties[prop.IRI] = prop;
            }
            const comments = this.getComments(property.subject);
//             console.log("getComm",comments)
            for (let comment of comments) {
                prop.addComment(comment);
            }
//             console.log("=>",prop.comments)

            prop.label = this.getLabel(property.subject);
            this.getDomains(property.subject).map(domain => prop.addDomain(domain));
            let ranges = this.getRanges(property.subject);
            ranges.map(range => prop.addRange(range));
            const superProperties = this.getSuperProperties(property.subject);
            if (superProperties) {
               superProperties.map(superPropertyIRI => {
                  let superProperty = this.addProperty(superPropertyIRI);
                  if (superProperty) {
                     prop.addSuperProperty(superProperty);
                     let superPropertyNode = rdf.sym(superPropertyIRI);
                     this.getProperties(superPropertyNode);
                  }
               });
            }

            props[property.subject.value] = prop;
        }

//         console.groupEnd();
//         console.log("props:",props)

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

    getSuperclasses(node: Node): ?string[] {
        let superclasses = this.getObjects(node, SUBCLASS_OF);

        return superclasses;
    }

    getSuperProperties(node: Node): ?string[] {
        let superProperties = this.getObjects(node, SUBPROPERTY_OF);

        return superProperties;
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

        let superclasses = this.getSuperclasses(node);
        if (superclasses) {
            for (let superclass of superclasses) {
                nodeDomains = nodeDomains.concat(this.getDomains(superclass));
            }
        }

        let superProperties = this.getSuperProperties(node);
        if (superProperties) {
            for (let superProperty of superProperties) {
                if (superProperty !== node.value) {
                    let superPropertyDomains = this.getDomains(new NamedNode(superProperty));
                    nodeDomains = nodeDomains.concat(superPropertyDomains);
                }
            }
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

        let superclasses = this.getSuperclasses(node);
        if (superclasses) {
            for (let superclass of superclasses) {
                ranges = ranges.concat(this.getRanges(superclass));
            }
        }

        let superProperties = this.getSuperProperties(node);
        if (superProperties) {
            for (let superProperty of superProperties) {
                if (superProperty !== node.value) {
                    let superPropertyRanges = this.getRanges(new NamedNode(superProperty));
                    ranges = ranges.concat(superPropertyRanges);
                }
            }
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

    getComments(object: Node): RDFComment[] {
        let comments: RDFComment[] = [];
        let values = this.getStatements(object, COMMENT, undefined);
        for (let commentData of values) {
            let lang = commentData.object.lang;
            let text = commentData.object.value;
            let comment: RDFComment = {
                lang: lang,
                comment: text
            };
            comments.push(comment);
        }

        return comments;
    }

    getLabel(object: Node): string {
        let values = this.getStatements(object, LABEL, undefined);
        return values.map(node => node.object.value).join('; ');
    }

    addClass(classIRI: string): ?RDFClass {
        if (!classIRI.includes(':')) {
            return;
        }
        let rdfClass = this._classes[classIRI];
        if (!rdfClass) {
            rdfClass = new RDFClass(classIRI);
            this._classes[classIRI] = rdfClass;
        }
        if (!rdfClass.superclasses) {

            let superclasses = this.getSuperclasses(rdf.sym(classIRI));

            // console.log("addClass super",classIRI,superclasses)

            if (superclasses) {
                for (let superclassIRI of superclasses) {
                    let superclass = this._classes[superclassIRI];
                    if (!superclass) {
                        superclass = new RDFClass(superclassIRI);
                    }
                    // console.log("add",superclass.IRI)
                    rdfClass.addSuperclass(superclass);
                }
            }

           // console.log("class",rdfClass)
        }
        for  (let annotationPropIRI in this._annotationProperties) {
            let annotationProp = this._annotationProperties[annotationPropIRI];
            let addToClass = annotationProp.domains.length === 0;
            if (!addToClass) {
                for (let domain of annotationProp.domains) {
                    if (annotationProp.hasDomain(classIRI) ||
                        rdfClass.hasSuperclass(domain)
                    ) {
                        addToClass = true;
                    }
                }
            }
            if (addToClass) {
                rdfClass.addProperty(annotationProp);
            }
        }


//         console.log("class",classIRI,rdfClass);

        return rdfClass;
    }

    addProperty(propertyIRI: string): ?RDFProperty {
        if (!propertyIRI.includes(':')) {
            return;
        }
        let rdfProperty = this._properties[propertyIRI];
        if (!rdfProperty) {
            rdfProperty = new RDFProperty(propertyIRI);
            this._properties[propertyIRI] = rdfProperty;
        }
        if (!rdfProperty.superProperties) {
            let superProperties = this.getSuperProperties(rdf.sym(propertyIRI));
            if (superProperties) {
                for (let superpropertyIRI of superProperties) {
                    let superproperty = this._properties[superpropertyIRI];
                    if (!superproperty) {
                        superproperty = new RDFProperty(superpropertyIRI);
                        this._properties[superpropertyIRI] = superproperty;
                    }
                    rdfProperty.addSuperProperty(superproperty);
                }
            }
        }

        // console.log("add prop ",propertyIRI,rdfProperty);

        return rdfProperty;
    }

    addPropertyToClass(propertyIRI: string, classIRI: string) {
        let rdfClass = this.addClass(classIRI);
        let rdfProperty = this.addProperty(propertyIRI);
        if (rdfClass && rdfProperty) {
            rdfClass.addProperty(rdfProperty);
        }
    }

    isProperty(IRI: string): boolean {
        return this._properties.hasOwnProperty(IRI);
    }

    isClass(IRI: string): boolean {
        return this._classes.hasOwnProperty(IRI);
    }
}
