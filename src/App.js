import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Contacts from './container/contacts/contacts';
import "./App.css"

class App extends React.Component {
  render() {
    return (<>
      <Switch>
        <Route component={Contacts} />
      </Switch>
    </>
    )
  }
}

export default App;
