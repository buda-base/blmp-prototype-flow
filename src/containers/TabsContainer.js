// @flow
// import Auth from 'Auth/Auth';
// import React from 'react';
import { connect } from 'react-redux';
import * as ui from 'state/ui/actions';
import selectors from 'state/selectors';
import TabsBar from 'components/TabsBar';
// import store from "../index.js";

const mapStateToProps = (state,ownProps) => {
    const tabsOrder: number[] = selectors.getTabsOrder(state);
    const selectedTabId = selectors.getSelectedTabId(state);
    const selectedTabIndex = tabsOrder.indexOf(selectedTabId);
    const tabData = tabsOrder.map(tabId => {
        const resourceId = selectors.getEditingResourceIRI(state, tabId);
        const resource = selectors.getResource(state, resourceId);
        return {
            tabId,
            resourceId,
            resource
        }
    });

    //console.log("Tabs mS2p",tabData);

    return {
      ...ownProps,
        tabData,
        selectedTabIndex
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onSelectTab: (tabId: number) => {
            dispatch(ui.selectTab(tabId));
        },
        onCloseTab: (tabId: number) => {
            dispatch(ui.closeTab(tabId));
        },
        onNewTab: () => {
            dispatch(ui.newTab());
        },
        onEditingResourceInNewTab: (resourceIRI: string) => {
            dispatch(ui.editingResourceInNewTab(resourceIRI));
        }
    }
}

const TabsContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(TabsBar);

export default TabsContainer;
