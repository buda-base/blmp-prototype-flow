import store from 'index';
import React, { Component } from 'react';
import TabsContainer from 'containers/TabsContainer';
import TabContentContainer from 'containers/TabContentContainer';
import './App.css';
import { withCookies, Cookies } from 'react-cookie';
import { instanceOf } from 'prop-types';
import * as data from 'state/data/actions';
import { initiateApp } from 'state/actions';

type Props = {
    selectedTabId: number | null
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

       let tabs=<TabsContainer /> ;

        return (
            <div className="App">
                {tabs}
                <TabContentContainer
                    tabId={this.props.selectedTabId}
                />
            </div>
        );
    }
}

// export default App;

export default withCookies(App);
