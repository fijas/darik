import React, {Component} from 'react';
import './App.css';
import AppDrawer from "./components/AppDrawer/AppDrawer";

class App extends Component {

    render() {
        return (
            <div className="App">
                <AppDrawer/>
            </div>
        );
    }
}

export default App;
