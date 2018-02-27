// @flow
import React, { Component } from 'react';
import TabsList, { Tab } from 'material-ui/Tabs';
import IconButton from 'material-ui/IconButton';
import AddBoxIcon from 'material-ui-icons/AddBox';
import Button from 'material-ui/Button';
import HighlighOffIcon from 'material-ui-icons/HighlightOff';
import Individual from 'lib/Individual';
import formatIRI from 'lib/formatIRI';
import store from '../index.js';
import * as ui from 'state/ui/actions';

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
    onNewTab: () => void,
    auth:Auth
}

export default class Tabs extends Component<Props> {

    _onSelectTab(event: {}, value: number) {
        const tabId = this.props.tabData[value].tabId;
        this.props.onSelectTab(tabId);
    }

    _onCloseTab(i:number, event: Event) {
        const tabId = this.props.tabData[i].tabId;
//         console.log("closeTab?",i,tabId,this.props);
        event.stopPropagation();
        this.props.onCloseTab(tabId);
        if(i == this.props.selectedTabIndex)
        {
           //this.props.onSelectTab(this.props.tabData[this.props.tabData.length-1].tabId);

            let tab = store.getState().ui.tabsOrder
            store.dispatch(ui.selectTab(tab[tab.length-1]));
        }
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

   goTo(route) {
     this.props.history.replace(`/${route}`)
   }

   login() {
     this.props.auth.login();
   }

   logout() {
     this.props.auth.logout();
   }

    render() {

      console.log("props",this.props)

      const { isAuthenticated } = this.props.auth;

        return(
            <div className="Tabs">
                <TabsList
                    onChange={this._onSelectTab.bind(this)}
                    value={this.props.selectedTabIndex}
                >
                    {this.props.tabData.map((data,i) => {
                        return <Tab key={i}
                            style={{
                                width: 240
                            }}
                            label={
                                <div>
                                    <IconButton
                                        onClick={this._onCloseTab.bind(this,i)}
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
                <div className="auth">
                   {
              !isAuthenticated() && (
                  <Button
                    bsStyle="primary"
                    className="btn-margin"
                    onClick={this.login.bind(this)}
                  >
                    Log In
                  </Button>
                )
            }
            {
              isAuthenticated() && (
                  <Button
                    bsStyle="primary"
                    className="btn-margin"
                    onClick={this.logout.bind(this)}
                  >
                    Log Out
                  </Button>
                )
            }
                </div>

            </div>
        );
    }
}
