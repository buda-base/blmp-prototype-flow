// @flow

export default class RDFProperty {
    _IRI: string;
    _superProperties: RDFProperty[];
    _range = {};
    _domains = [];

    constructor(IRI: string) {
        this._IRI = IRI;
    }

    get IRI(): string {
        return this._IRI;
    }

    get superProperties(): ?RDFProperty[] {
        return this._superProperties;
    }

    addSuperProperty(property: RDFProperty) {
        if (!this._superProperties) {
            this._superProperties = [];
        }
        this._superProperties.push(property);
    }
}