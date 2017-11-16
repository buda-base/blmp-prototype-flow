// @flow
import React, { Component } from 'react';
import TabsList, { Tab } from 'material-ui/Tabs';
import Individual from 'lib/Individual';
import formatIRI from 'lib/formatIRI';

export type TabData = {
    tabId: number,
    resourceId: string,
    resource?: Individual
}

type Props = {
    tabData: TabData[],
    selectedTabIndex: number,
    onSelectTab: (tabId: number) => void
}

export default class Tabs extends Component<Props> {

    _onSelectTab(event: {}, value: number) {
        const tabId = this.props.tabData[value].tabId;
        this.props.onSelectTab(tabId);
    }

    getLabel(data: TabData) {
        if (data.resource && data.resource.label) {
            return data.resource.label;
        } else if (data.resourceId) {
            return formatIRI(data.resourceId);
        } else {
            return "Select a resource";
        }
    }

    render() {
        return(
            <div className="Tabs">
                <TabsList
                    onChange={this._onSelectTab.bind(this)}
                    value={this.props.selectedTabIndex}
                >
                    {this.props.tabData.map(data => {
                        return <Tab
                            label={this.getLabel(data)}
                        />
                    })}
                </TabsList>
            </div>
        );
    }
}
