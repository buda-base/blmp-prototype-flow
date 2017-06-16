// @flow

export default class RDFProperty {
    _IRI: string;
    _superProperties: RDFProperty[];
    _ranges: string[] = [];
    _domains: string[] = [];

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

    get ranges(): string[] {
        return this._ranges;
    }

    hasRange(range: string): boolean {
        return this._ranges.indexOf(range) !== -1;
    }

    addRange(range: string) {
        this._ranges.push(range);
    }

    get domains(): string[] {
        return this._domains;
    }

    hasDomain(domain: string): boolean {
        return this._domains.indexOf(domain) !== -1;
    }

    addDomain(domain: string) {
        this._domains.push(domain);
    }
}