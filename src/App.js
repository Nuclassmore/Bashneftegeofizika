import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Redirect, Switch} from "react-router-dom";
import './App.css';
import Home from './components/Home';
import SignIn from './components/SignIn';

const PrivateRoute = ({ component: Component}) => (
  <Route render={(props) => (1 === 1 ? <Component/> : <Redirect to='/signIn' />)} />
)

const NormalRoute = ({ component: Component}) => (
  <Route exact render={(props) => (1 === 0 ? <Component/> : <Redirect to='/home'/>)} />
)

export default class App extends Component {
  constructor(props){
    super(props);
    this.state = {
    }
  }

  render() {
    return (
      <Router>
      <Switch>
        <NormalRoute path="/signIn" component={SignIn} />
        <PrivateRoute path="/home" component={Home} />
        <PrivateRoute path="/" component={Home} />
      </Switch>
      </Router>
    );
  }

}
