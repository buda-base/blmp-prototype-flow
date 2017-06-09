
export default class Individual {
    _id: string;
    _types: string[];
    _properties: {};

    constructor(id: ?string) {
        this._id = id;
        this._properties = {};
        this._types = [];
    }

    get id(): string {
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

    getProperty(name: string): {} {
        return this._properties[name];
    }

    addProperty(name: string, value: {}) {
        if (!this._properties.hasOwnProperty(name)) {
            this._properties[name] = [];
        }

        this._properties[name].push(value);
    }

    removeProperty(name: string, value: {}) {
        if (this._properties[name]) {
            this._properties[name] = this._properties[name].filter(val => val !== value);
        }
    }

    getProperties() {
        return this._properties;
    }
}