import * as reducers from './reducers';
import * as actions from './actions';
import Individual from 'lib/Individual';
import RDFProperty from 'lib/RDFProperty';

describe('test reducers', () => {
    let state = {
        editingResources: {}
    }

    const tabId = 1;

    test('newTab', () => {
        state = reducers.newTab(state, actions.newTab());
        expect(
            state
        ).toEqual(
            {
                editingResources: {
                    [tabId]: {
                        tabId: tabId,
                        resourceId: null,
                        selectedResourceIRI: null,
                        addingResource: null,
                        findResource: null
                    }
                },
                activeTabId: tabId
            }
        );
    });

    test('selectTab', () => {
        state = reducers.selectTab(state, actions.selectTab(tabId));
        expect(
            state.activeTabId
        ).toEqual(tabId);
    });

    const resourceIRI = 'http://purl.bdrc.io/resource/G844';

    test('editingResource', () => {
        state = reducers.editingResource(state, actions.editingResource(tabId, resourceIRI));
        expect(
            state
        ).toEqual(
            {
                editingResources: {
                    [tabId]: {
                        tabId: tabId,
                        resourceId: resourceIRI,
                        selectedResourceIRI: null,
                        addingResource: null,
                        findResource: null
                    }
                },
                activeTabId: tabId
            }
        );
    });

    const selectedResourceIRI = 'http://purl.bdrc.io/resource/G843';

    test('selectedResourceIRI', () => {
        state = reducers.selectedResourceIRI(state, actions.selectedResourceIRI(tabId, selectedResourceIRI));
        expect(
            state
        ).toEqual(
            {
                editingResources: {
                    [tabId]: {
                        tabId: tabId,
                        resourceId: resourceIRI,
                        selectedResourceIRI: selectedResourceIRI,
                        addingResource: null,
                        findResource: null
                    }
                },
                activeTabId: tabId
            }
        );
    });
    
    const individual = new Individual();
    const propertyIRI = 'http://purl.bdrc.io/ontology/admin/place_TLM_num';
    const property = new RDFProperty(propertyIRI);

    test('addingResource', () => {    
        const action = actions.addingResource(tabId, individual, property);
        state = reducers.addingResource(state, action);
        expect(
            state.editingResources[tabId].addingResource.individual.id
        ).toEqual(
            individual.id
        )

        expect(
            state.editingResources[tabId].addingResource.property.IRI
        ).toEqual(
            property.IRI
        )
    });

    test('cancelAddingResource', () => {
        const action = actions.cancelAddingResource(tabId);
        state = reducers.cancelAddingResource(state, action);
        expect(
            state
        ).toEqual(
            {
                editingResources: {
                    [tabId]: {
                        tabId: tabId,
                        resourceId: resourceIRI,
                        selectedResourceIRI: selectedResourceIRI,
                        addingResource: null,
                        findResource: null
                    }
                },
                activeTabId: tabId
            }
        )
    });

    const findResourceIRI = 'http://purl.bdrc.io/resource/G842';

    test('findResource', () => {
        const action = actions.findResource(tabId, findResourceIRI);
        state = reducers.findResource(state, action);
        expect(
            state
        ).toEqual(
            {
                editingResources: {
                    [tabId]: {
                        tabId: tabId,
                        resourceId: resourceIRI,
                        selectedResourceIRI: selectedResourceIRI,
                        addingResource: null,
                        findResource: findResourceIRI
                    }
                },
                activeTabId: tabId
            }
        )
    });

    test('addedFoundResource', () => {
        // make sure addingResource is set for test
        let action = actions.addingResource(tabId, individual, property);
        state = reducers.addingResource(state, action);

        action = actions.addedFoundResource(tabId);
        state = reducers.addedFoundResource(state, action);
        expect(
            state
        ).toEqual(
            {
                editingResources: {
                    [tabId]: {
                        tabId: tabId,
                        resourceId: resourceIRI,
                        selectedResourceIRI: selectedResourceIRI,
                        addingResource: null,
                        findResource: null
                    }
                },
                activeTabId: tabId
            }
        )
    });
});
