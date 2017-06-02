import Ontology from './Ontology';

const ontologyData = `<?xml version="1.0"?>
<rdf:RDF xmlns="http://purl.bdrc.io/ontology/root#"
     xml:base="http://purl.bdrc.io/ontology/root"
     xmlns:owl="http://www.w3.org/2002/07/owl#"
     xmlns:xsd="http://www.w3.org/2001/XMLSchema#"
     xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
     xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
     xmlns:xml="http://www.w3.org/XML/1998/namespace">
    <owl:Ontology rdf:about="http://purl.bdrc.io/ontology/root#">
        <rdfs:label rdf:datatype="http://www.w3.org/2001/XMLSchema#string">BDRC Ontology</rdfs:label>
        <owl:versionInfo rdf:datatype="http://www.w3.org/2001/XMLSchema#string">0.1</owl:versionInfo>
    </owl:Ontology>

    <!-- http://purl.bdrc.io/ontology/place#Place -->

    <owl:Class rdf:about="http://purl.bdrc.io/ontology/place#Place">
        <rdfs:subClassOf rdf:resource="http://purl.bdrc.io/ontology/root#Resource"/>
        <inferSubTree rdf:datatype="http://www.w3.org/2001/XMLSchema#boolean">true</inferSubTree>
    </owl:Class>
    
    <!-- http://purl.bdrc.io/ontology/place#objectProperty -->

    <owl:ObjectProperty rdf:about="http://purl.bdrc.io/ontology/place#objectProperty"/>
    
    <!-- http://purl.bdrc.io/ontology/place#hasAddress -->

    <owl:ObjectProperty rdf:about="http://purl.bdrc.io/ontology/place#hasAddress">
        <rdfs:subPropertyOf rdf:resource="http://purl.bdrc.io/ontology/place#objectProperty"/>
        <rdfs:domain rdf:resource="http://purl.bdrc.io/ontology/place#Place"/>
        <rdfs:range rdf:resource="http://purl.bdrc.io/ontology/place#Address"/>
    </owl:ObjectProperty>
    
    <!-- http://purl.bdrc.io/ontology/place#Address -->

    <owl:Class rdf:about="http://purl.bdrc.io/ontology/place#Address">
        <rdfs:subClassOf rdf:resource="http://purl.bdrc.io/ontology/place#Facet"/>
        <rdfs:comment>The plc:Address allows to record conventional address informaton for a Place. It is added to support the Tibetan Library Management application that allows for recording holdings of Works from other libraries.</rdfs:comment>
    </owl:Class>
    
    <!-- http://purl.bdrc.io/ontology/place#addressProperty -->

    <owl:DatatypeProperty rdf:about="http://purl.bdrc.io/ontology/place#addressProperty">
        <rdfs:subPropertyOf rdf:resource="http://purl.bdrc.io/ontology/place#dataProperty"/>
        <rdfs:domain rdf:resource="http://purl.bdrc.io/ontology/place#Address"/>
    </owl:DatatypeProperty>
    
    <!-- http://purl.bdrc.io/ontology/place#address_city -->

    <owl:DatatypeProperty rdf:about="http://purl.bdrc.io/ontology/place#address_city">
        <rdfs:subPropertyOf rdf:resource="http://purl.bdrc.io/ontology/place#addressProperty"/>
        <rdfs:range rdf:resource="http://www.w3.org/2001/XMLSchema#string"/>
    </owl:DatatypeProperty>

</rdf:RDF>
`;

let ontology: Ontology;

beforeAll(done => {
    Ontology.create(ontologyData, 'http://purl.bdrc.io/ontology/root#', 'application/rdf+xml')
        .then(newOntology => {
            ontology = newOntology;
        })
        .catch(e => {
            console.warn('Error creating ontology: %o', e);
        })
        .then(() => done());
});


describe('Ontology', () => {

    test('Getting ontology properties', () => {
        const place = 'http://purl.bdrc.io/ontology/place#Place';
        const expectedProperties = [
            {
                name: 'http://purl.bdrc.io/ontology/place#hasAddress',
                ranges: [
                    'http://purl.bdrc.io/ontology/place#Address'
                ]
            }
        ];

        expect(
            ontology.getClassProperties(place)
        ).toEqual(expectedProperties);
    });

});
