// @flow
import React from 'react';
import { connect } from 'react-redux';
import * as ui from 'state/ui/actions';
import selectors from 'state/selectors';
import Tabs from 'components/Tabs';

const mapStateToProps = (state) => {
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
    return {
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
        }
    }
}

const TabsContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Tabs);

export default TabsContainer;