// @flow
import RDFProperty from './RDFProperty';

export default class RDFClass {
    _IRI: string;
    // Don't set this automatically so that we know if it's been set or not;
    _superclasses: RDFClass[];
    _properties = {};

    constructor(IRI: string) {
        this._IRI = IRI;
    }

    get IRI(): string {
        return this._IRI;
    }

    get superclasses(): RDFClass[] {
        return this._superclasses;
    }

    addSuperclass(superclass: RDFClass) {
        if (!this._superclasses) {
            this._superclasses = [];
        }
        this._superclasses.push(superclass);
    }

    addProperty(property: RDFProperty) {
        if (!this._properties[property.IRI]) {
            this._properties[property.IRI] = property;
        }
    }
}