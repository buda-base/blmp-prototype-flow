// @flow
import React, { Component } from 'react';
import TabsList, { Tab } from 'material-ui/Tabs';
import IconButton from 'material-ui/IconButton';
import AddBoxIcon from 'material-ui-icons/AddBox';
import HighlighOffIcon from 'material-ui-icons/HighlightOff';
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
    onSelectTab: (tabId: number) => void,
    onCloseTab: (tabId: number) => void,
    onNewTab: () => void
}

export default class Tabs extends Component<Props> {

    _onSelectTab(event: {}, value: number) {
        const tabId = this.props.tabData[value].tabId;
        this.props.onSelectTab(tabId);
    }

    _onCloseTab(event: Event) {
        const tabId = this.props.tabData[this.props.selectedTabIndex].tabId;
        event.stopPropagation();
        this.props.onCloseTab(tabId);
    }

    _onNewTab(event: {}) {
        this.props.onNewTab();
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
                            style={{
                                width: 300
                            }}
                            label={
                                <div> 
                                    <IconButton
                                        onClick={this._onCloseTab.bind(this)}
                                        style={{
                                            position: 'absolute',
                                            top: 1,
                                            left: -5
                                        }}
                                    >
                                        <HighlighOffIcon
                                            style={{
                                                width: 20,
                                                height: 20
                                            }}
                                        />
                                    </IconButton>
                                    {this.getLabel(data)}
                                </div>
                            }
                        />
                    })}
                    <IconButton
                        onClick={this._onNewTab.bind(this)}
                    >
                        <AddBoxIcon />
                    </IconButton>
                </TabsList>
                
                
            </div>
        );
    }
}