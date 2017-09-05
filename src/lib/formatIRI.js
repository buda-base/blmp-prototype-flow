// @flow
import capitalize from './capitalize'

const BDRC_ONTOLOGY = 'http://purl.bdrc.io/ontology/core/';
const ADMIN = 'http://purl.bdrc.io/ontology/admin/';
const RESOURCE = 'http://purl.bdrc.io/resource/';
const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const RDFS = 'http://www.w3.org/2000/01/rdf-schema#';
const SKOS = 'http://www.w3.org/2004/02/skos/core#';
const TBR = 'http://purl.bdrc.io/ontology/toberemoved/';

export default function formatIRI(IRI: string): string {
    let value = (IRI) ? IRI : "";
    let prefixes = [BDRC_ONTOLOGY, ADMIN, RESOURCE, RDF, RDFS, SKOS, TBR];
    for (let prefix of prefixes) {
        if (IRI.indexOf(prefix) !== -1) {
            value = IRI.replace(prefix, '');
            break;
        }
    }

    if (value.indexOf('/') !== -1) {
        return value.replace(/^(.+)\/(.)(.*)/gm, (match, parentPath, first, remaining) => {
            return parentPath + '/' + first.toUpperCase() + remaining;
        });
    } else {
        return capitalize(value);
    }
}