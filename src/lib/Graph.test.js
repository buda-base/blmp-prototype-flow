import Graph from './Graph'

const graphData = `{
  "@graph": [
    {
      "rdfs:label": {
        "@language": "bo",
        "@value": "བྱ་ཡུལ"
      },
      "status": "released",
      "@id": "plc:G844",
      "@type": [
        "plc:Place",
        "plc:RgyalPhran"
      ],
      "name": [
        {
          "@language": "bo",
          "@value": "བྱ་པ་ཁྲི་དཔོན་གྱི་མངའ་ཁོངས"
        },
        {
          "@language": "bo",
          "@value": "བྱ་པའི་ཡུལ"
        },
        {
          "@language": "bo",
          "@value": "བྱ་ཡུལ"
        }
      ],
      "note": [
        {
          "@id": "http://purl.bdrc.io/ontology/root/G844_Note2",
          "@type": "Note",
          "note_content": {
            "@language": "bo",
            "@value": "བྱ་པ་ཁྲི་དཔོན་དང་འབྲེལ་བའི་ཆོས་རྒྱལ་བྱ་པའི་ལོ་རྒྱུས་དཔྱིད་ཀྱི་རྒྱལ་མོའི་གླུ་དབྱངས་ཀྱི་ནང་དོན་དང་འབྲེལ་ནས་བཀོད་པ་གསལ།"
          },
          "note_location": "p.1467-1468",
          "note_work": {
            "@id": "wor:W26372"
          }
        },
        {
          "@id": "http://purl.bdrc.io/ontology/root/G844_Note1",
          "@type": "Note",
          "note_content": {
            "@language": "en",
            "@value": "the region of the rulers of the bya principality in southern tibet"
          }
        }
      ]
    }
  ],
  "@context": {
    "@vocab": "http://purl.bdrc.io/ontology/root#",
    "com": "http://purl.bdrc.io/ontology/common#",
    "crp": "http://purl.bdrc.io/ontology/corporation#",
    "prd": "http://purl.bdrc.io/ontology/product#",
    "owl": "http://www.w3.org/2002/07/owl#",
    "plc": "http://purl.bdrc.io/ontology/place#",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "ofc": "http://purl.bdrc.io/ontology/office#",
    "out": "http://purl.bdrc.io/ontology/outline#",
    "lin": "http://purl.bdrc.io/ontology/lineage#",
    "top": "http://purl.bdrc.io/ontology/topic#",
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "wor": "http://purl.bdrc.io/ontology/work#",
    "per": "http://purl.bdrc.io/ontology/person#",
    "vol": "http://purl.bdrc.io/ontology/volumes#",
    "desc": "http://onto.bdrc.io/ontology/description#"
  }
}
`;

let graph: Graph;

// TODO implement test. Need to load ontology as well;