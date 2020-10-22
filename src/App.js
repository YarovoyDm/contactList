import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Contacts from './container/contacts/contacts';
import "./App.css"

class App extends React.Component {
  render() {
    return (<>
      <Switch>
        <Route component={Contacts} />
        {/* <Route path='/contacts' exact={true} component={Contacts} /> for localhost check, can't setup github pages for SPA*/} 
      </Switch>
    </>
    )
  }
}

export default App;
