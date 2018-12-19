# blmp-prototype-flow 

This is an evolving prototype of the BLMP. It currently allows loading of resources which can then be edited, but not saved.

## Install

It is recommended to use [yarn](https://yarnpkg.com/) to install the app and any other packages. Installation instructions for each platform are on their [website](https://yarnpkg.com/lang/en/docs/install/).

This will install nodejs as well. yarn is similar to npm (which you may have used in the past), but has better performance and more reliable dependency resolution.

After yarn is installed, clone the repo, then simply run

    yarn install

To start the test server:

    yarn start

It should automatically open the test page in Chrome. Otherwise, visit <http://localhost:3000>

### Copy .ttl files

Currently, in order to load resources, you will also need to copy a directory of .ttl files (available from Élie) to the `/public/objects` directory. e.g.:

        /public/objects/corporations/C1.ttl

        /public/objects/places/00/G00AG02558.ttl

## Development

### Config

The project was created using [create-react-app](https://github.com/facebookincubator/create-react-app).

However, it needed to be 'ejected' in order to change some settings required for rdflib, which is rdf library we use. As such, any updates to the create-react-app scripts will need to be applied manually. This should not be required but there may be some feature additions in future which would make an upgrade worth it.

Included is a simple node server to serve the files and allow testing in a browser.

### Libraries

The UI is implemented using a React/Redux stack:

* [React](https://facebook.github.io/react/)

    For the view layer.

* [Redux](http://redux.js.org/)

    For managing data and state.

* [Redux-Saga](https://github.com/redux-saga/redux-saga)

    For managing side-effects e.g. API calls over the Network.

* [webpack](https://webpack.js.org/)

    For building/packaging the code. This is automatically invoked when running yarn start.

* [Jest](https://facebook.github.io/jest/)

    Used for testing

### Redux

The redux files are stored in `src/state`. There are currently `ui` and `data` subdirectories for storing files related to the current state of the UI and the data that has been downloaded.

The `selectors` file in the top-level state directory imports all the selectors from the subdirectories and enables them to be called with the `state` object provided by `redux-connect`'s `mapStateToProps` function. As such, the way the state is structured internally does not need to be known by code calling the selectors.

### RDF related code

Located in `src/lib`

*  `Ontology.js`

    Allows parsing an owl file and selecting properties for RDF classes. See `Ontology.test.js` for an example of how to use it.

* `Graph.js`

    Parses an RDF graph and extracts individual resources along with their properties and values.

### Styling RDF components

When `IndividualView` displays nested individuals for a property, it will check if there is a related class in `src/components/RDF`. If there is, it will display a component based on the class.

There are currently a few limited examples:

    Address.js:     http://www.w3.org/2006/vcard/ns#Address
    LogEntry.js:    http://purl.bdrc.io/ontology/admin/LogEntry
    Note.js:        http://purl.bdrc.io/ontology/core/Note

These subclass `RDFComponent` and must export an IRI variable for the property it is for. See one of the files for details.



## Settings

### URL to lds-pdi

<!--By default, the app will test on startup where lds-pdi is reachable. The first candidate url is `http://localhost:8080`, then it tries `http://localhost:13280` and finally `http://buda1.bdrc.io`.

This automatic setting can be bypassed using a `GET` parameter if needed: `?lds-pdi=...`. For example, `http://localhost:13280?ldspdi=bdrc1.bdrc.io:13280` will use the online `fuseki` server instead of the default `http://localhost:13280`.-->

There is a `config-defauls.json` located in `/public` directory. It contains:
* a list of candidate urls to `lds-pdi`
* an index in the list to use on startup.

Default settings can be overridden using a separate `/public/config.json`.
