import React, { Component } from 'react';
import TabsContainer from 'containers/TabsContainer';
import TabContentContainer from 'containers/TabContentContainer';
import './App.css';

type Props = {
    selectedTabId: number | null
}

class App extends Component<Props> {

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

export default App;
