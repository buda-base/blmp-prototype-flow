import Auth from 'Auth/Auth';
import store from 'index';
import React, { Component } from 'react';
import TabsContainer from 'containers/TabsContainer';
import TabContentContainer from 'containers/TabContentContainer';
import './App.css';
import { withCookies, Cookies } from 'react-cookie';
import { instanceOf } from 'prop-types';
import * as data from 'state/data/actions';
import { initiateApp } from 'state/actions';

export const auth = new Auth();


type Props = {
    selectedTabId: number | null,
    logged?:boolean
}

class App extends Component<Props> {
   static propTypes = {
    cookies: instanceOf(Cookies).isRequired
   };

   constructor(props)
   {
      super(props);

      const { cookies } = this.props ;
      store.dispatch(data.weHaveCookies(cookies));
      store.dispatch(initiateApp());
   }

   render() {
      console.log("render?")

       let tabs=<TabsContainer auth={this.props.auth} logged={this.props.logged} /> ;

        return (
            <div className="App">
                {tabs}
                <TabContentContainer
                    auth={this.props.auth}
                    logged={this.props.logged}
                    tabId={this.props.selectedTabId}
                    saving={this.props.saving}
                />
            </div>
        );
    }
}

// export default App;

export default withCookies(App);
