# blmp-prototype-flow

This is still early in development and the UI does not do much at present. It ports the code in `blmp-prototype` from typescript to flow, and has now added processing of an rdf graph along with ontologies. It currently hard-codes the graph to an example place, `/public/placeG844.json`. 

The main code is currently in `/src/lib`:

*  `Ontology.js`, which allows parsing an owl file and selecting properties for RDF classes. See `Ontology.test.js` for an example of how to use it.
 
* `Graph.js`, which parses an RDF graph and extracts individual resources along with their properties and values.


## Install

Make sure nodejs is installed. Then, after cloning the repo, simply run

    npm install
    
To start the test server:

    npm start
    
It should automatically open the test page in Chrome. Otherwise, visit <http://localhost:3000>