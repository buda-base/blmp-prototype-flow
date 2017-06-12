// @flow
import capitalize from './capitalize'

const BDRC_ONTOLOGY = 'http://purl.bdrc.io/ontology/';
const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const RDFS = 'http://www.w3.org/2000/01/rdf-schema#';

export default function formatIRI(IRI: string): string {
    let value = (IRI) ? IRI : "";

    if (IRI.indexOf(BDRC_ONTOLOGY) !== -1) {
        let endPath = IRI.replace(BDRC_ONTOLOGY, '');
        let segments = endPath.split('#');
        if (segments.length > 1) {
            switch(segments[0]) {
                case 'place':
                case 'root':
                default:
                    value = segments[1];

            }
        }
    } else {
        for (let ns of [RDF, RDFS]) {
            if (IRI.indexOf(ns) !== -1) {
                value = IRI.replace(ns, '');
                break;
            }
        }
    }

    return capitalize(value);
}