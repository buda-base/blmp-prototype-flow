// @flow

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

    getProperty(name: string): [] | null {
        return this._properties[name];
    }

    addProperty(name: string, value: {}) {
        if (!this._properties[name]) {
            this._properties[name] = [];
        }
        this._properties[name].push(value);
    }

    removeProperty(type: string, name: string, value: {}) {
        if (this._properties[name]) {
            this._properties[name] = this._properties[name].filter(val => val !== value);
        }
    }

    getProperties(type: ?string) {
        let props = {};
        if (type) {
            for (let prop in this._properties) {
                if (this._properties.hasOwnProperty(prop)) {
                    if (prop === type) {
                        props[prop] = this._properties[prop];
                    }
                }
            }
        } else {
            props = this._properties;
        }
        return props;
    }
}