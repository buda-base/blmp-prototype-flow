// @flow
import RDFProperty from './RDFProperty';

export default class RDFClass {
    _IRI: string;
    // Don't set this automatically so that we know if it's been set or not;
    _superclasses: RDFClass[];
    _properties = {};
    _children: RDFClass[] = [];
    _values: string[] = [];


    constructor(IRI: string) {
        this._IRI = IRI;
    }

    get IRI(): string {
        return this._IRI;
    }

    get properties(): RDFProperty[] {
        return Object.keys(this._properties).map(prop => this._properties[prop]);
    }

    get superclasses(): RDFClass[] {
        return this._superclasses;
    }

    addSuperclass(superclass: RDFClass) {
        if (!this._superclasses) {
            this._superclasses = [];
        }
        if (!this.hasSuperclass(superclass.IRI)) {
            this._superclasses.push(superclass);
            superclass.addChild(this);
        }
    }

    hasSuperclass(superclassIRI: string): boolean {
        return this._superclasses &&
                this._superclasses
                    .filter(superclass => superclass.IRI === superclassIRI)
                    .length > 0;
    }


    hasAncestorclass(superclassIRI: string): boolean {
        return this._superclasses &&
                this._superclasses
                    .filter(superclass => superclass.IRI === superclassIRI || superclass.hasSuperclass(superclassIRI))
                    .length > 0;
    }
    
    addProperty(property: RDFProperty) {
        if (!this._properties[property.IRI]) {
            this._properties[property.IRI] = property;
        }
    }

    get children(): RDFClass[] {
        return this._children;
    }

    addChild(child: RDFClass) {
        if (this._children.indexOf(child) === -1) {
            this._children.push(child);
        }
    }
    
    get values(): RDFProperty[] {
        return this._values;
    }

    addValue(value: RDFProperty) {
        if (this._values.indexOf(value) === -1) {
            this._values.push(value);
        }
    }

}