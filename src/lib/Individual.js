
export default class Individual {
    _id: string;
    // TODO: type needs to be an array of strings as individuals can have multiple types
    _types: string[];
    _properties: {};

    constructor(id: ?string) {
        this._id = id;
        this._properties = {};
        this._types = [];
    }

    get id() {
        return this._id;
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

    getProperties() {
        return this._properties;
    }
}