// @flow
import api, { APIResponse } from './api';
import Ontology from '../lib/Ontology';
import Individual from '../lib/Individual';

const OBJECT = 'G844';
const OBJECT_PATH = '/objects/places/ea/G844.ttl';

const ONTOLOGY_SUCCESS = `
<?xml version="1.0"?>
<rdf:RDF xmlns="http://purl.bdrc.io/ontology/core/"
     xml:base="http://purl.bdrc.io/ontology/core/"
     xmlns:owl="http://www.w3.org/2002/07/owl#"
     xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
     xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
     xmlns:xml="http://www.w3.org/XML/1998/namespace"
     >
    <owl:Ontology rdf:about="http://purl.bdrc.io/ontology/core/">
        <rdfs:label rdf:datatype="http://www.w3.org/2001/XMLSchema#string">BDRC Ontology</rdfs:label>
        <owl:versionInfo rdf:datatype="http://www.w3.org/2001/XMLSchema#string">0.1</owl:versionInfo>
    </owl:Ontology>

    <owl:AnnotationProperty rdf:about="http://purl.bdrc.io/ontology/admin/logEntry">
        <rdfs:comment xml:lang="en">Log entry for updates to BDRC resources</rdfs:comment>
        <rdfs:label xml:lang="en">log entry</rdfs:label>
        <rdfs:range rdf:resource="http://purl.bdrc.io/ontology/admin/LogEntry"/>
        <rdfs:domain rdf:resource="http://purl.bdrc.io/ontology/core/Entity"/>
    </owl:AnnotationProperty>
</rdf:RDF>
`;

const OBJECT_SUCCESS = `@prefix :      <http://purl.bdrc.io/ontology/core/> .
@prefix bdr:   <http://purl.bdrc.io/resource/> .
@prefix skos:  <http://www.w3.org/2004/02/skos/core#> .
@prefix tbr:   <http://purl.bdrc.io/ontology/toberemoved/> .

bdr:G844  a                       :Place ;
    skos:altLabel                 "འདི་ཕྱག་བཏབ་པའི་དུས་ཚོད་ལ་ལས་༡༡༥༠ལོ་བྲིས་པ་མངོན་མོད། དེ་དུས་ཕྱག་འདེབས་པ།"@bo , "bya pa khri dpon gyi mnga' khongs"@bo-x-ewts ;
    tbr:place_town_syl            "Cai Gong Tang Xiang" .
`;

const responseTypes = {
    ONTOLOGY: "ONTOLOGY",
    OBJECT: "OBJECT"
}

type ResponseType = $Keys<typeof responseTypes>

class ResponseMock implements APIResponse {
    _type: ResponseType;

    constructor(type: ResponseType) {
        this._type = type;
    }

    text() {
        return new Promise((resolve, reject) => {
            if (this._type === responseTypes.ONTOLOGY) {
                resolve(ONTOLOGY_SUCCESS);
            } else {
                resolve(OBJECT_SUCCESS);
            }
        });
    }
}

function fetchMock(req: Request): Promise<APIResponse> {
    return new Promise((resolve, reject) => {
        let res;
        if (req.url === OBJECT_PATH) {
            res = new ResponseMock(responseTypes.OBJECT)
        } else {
            res = new ResponseMock(responseTypes.ONTOLOGY)
        }
        resolve(res);
    });
}

describe('Ontology', () => {
    test('Getting ontology', async () => {
        const bdrcAPI = new api({
            fetch: fetchMock
        });

        const ontology = await bdrcAPI.getOntology();
        expect(ontology instanceof Ontology).toBeTruthy();

        const cachedOntology = await bdrcAPI.getOntology();
        expect(ontology === cachedOntology).toBeTruthy();
    });
})

describe('Objects', () => {
    test('Getting object URL', () => {
        const bdrcAPI = new api();
        const expectedUrl = OBJECT_PATH;
        expect(
            bdrcAPI._getObjectURL(OBJECT)
        ).toEqual(expectedUrl);
    });

    test('Getting object data', async () => {
        const bdrcAPI = new api({
            fetch: fetchMock
        });

        const data = await bdrcAPI._getObjectData(OBJECT);
        expect(data).toEqual(OBJECT_SUCCESS);
    });

    test('Get object', async () => {
        const bdrcAPI = new api({
            fetch: fetchMock
        });

        const ind = await bdrcAPI.getObject(OBJECT);
        expect(ind instanceof Individual).toBeTruthy();
    });
});