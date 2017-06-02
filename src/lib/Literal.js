
export default class Literal {
    _type: string;
    _language: string;
    _value: string;

    constructor(type: string, value: string, language: ?string) {
        this._type = type;
        this._value = value;
        this._language = language;
    }
    
    get type(): string {
        return this._type;
    }

    get value(): string {
        return this._value;
    }

    get language(): string {
        return this._language;
    }

}