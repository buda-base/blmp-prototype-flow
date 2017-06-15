// @flow

export const DATATYPE_PROPERTY = "http://www.w3.org/2002/07/owl#DatatypeProperty";
export const OBJECT_PROPERTY = "http://www.w3.org/2002/07/owl#ObjectProperty";
export const ANNOTATION_PROPERTY = "http://www.w3.org/2002/07/owl#AnnotationProperty";

export default class Individual {
    _id: ?string;
    _types: string[];
    _properties: {};

    constructor(id: ?string) {
        this._id = id;
        this._properties = {};
        this._types = [];
    }

    get id(): ?string {
        return this._id;
    }

    set id(newId: string) {
        this._id = newId;
    }

    get types(): string[] {
        return this._types;
    }

    addType(type: string) {
        this._types.push(type);
    }

    getProperty(name: string, type:string="NULL"): {} | null {
        let value = null;
        if (this._properties[type]) {
            value = this._properties[type][name];
        }
        return value;
    }

    addProperty(name: string, value: {}, type: string) {
        if (!this._properties[type]) {
            this._properties[type] = {};
        }
        this._properties[type][name] = value;
    }

    removeProperty(type: string, name: string, value: {}) {
        if (this._properties[name] && this._properties[name][type]) {
            this._properties[name] = this._properties[name].filter(val => val !== value);
        }
    }

    getProperties(type: ?string) {
        if (type) {
            return this._properties[type];
        }
        return this._properties;
    }
}