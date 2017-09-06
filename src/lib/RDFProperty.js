// @flow

export type RDFComment = {
    lang?: string,
    comment?: string
}

export default class RDFProperty {
    _IRI: string;
    _superProperties: RDFProperty[];
    _ranges: string[] = [];
    _domains: string[] = [];
    _propertyType: string;
    _children: RDFProperty[] = [];
    _comments: RDFComment[] = [];

    constructor(IRI: string) {
        this._IRI = IRI;
    }

    get IRI(): string {
        return this._IRI;
    }

    get superProperties(): ?RDFProperty[] {
        let superProperties = null;

        if (this._superProperties) {
            superProperties = [];
            for (let superProperty of this._superProperties) {
                superProperties.push(superProperty);
            }
        }

        return superProperties;
    }

    get propertyType(): string {
        return this._propertyType;
    }

    set propertyType(propertyType: string) {
        this._propertyType = propertyType;
    }

    hasSuperProperty(superPropertyIRI: string): boolean {
        return this._superProperties
                .filter(superProperty => superProperty.IRI === superPropertyIRI)
                .length > 0;
    }

    addSuperProperty(property: RDFProperty) {
        if (!this._superProperties) {
            this._superProperties = [];
        }
        if (!this.hasSuperProperty(property.IRI)) {
            this._superProperties.push(property);
            property.addChild(this);
        }
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

    get children(): RDFProperty[] {
        return this._children;
    }

    addChild(child: RDFProperty) {
        if (this._children.indexOf(child) === -1) {
            this._children.push(child);
        }
    }

    get comments(): RDFComment[] {
        return this._comments;
    }

    addComment(comment: RDFComment) {
        this._comments.push(comment);
    }
}