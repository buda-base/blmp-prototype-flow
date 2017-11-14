import React, { Component } from 'react';
import TabContainer from 'containers/TabContentContainer';
import './App.css';

type Props = {
    selectedTabId: number | null
}

class App extends Component<Props> {

    render() {
        return (
            <div className="App">
                <TabContainer 
                    tabId={this.props.selectedTabId}
                />
            </div>
        );
    }
}

export default App;
