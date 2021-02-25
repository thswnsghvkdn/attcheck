import React from "react";
import App from './App';
import LoginPage from './LoginPage'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

class WebApp extends React.Component{
  
render = () => { 
 return (
    <Router>
      <div>
        <Switch>
            <Route exact path = "/main" component = {App} />
            <Route exact path = "/" component = {LoginPage} />
        </Switch>
      </div>
    </Router>
  )};
}

//import { Redirect } from 'react-router-dom'
//!this.isLogin && <Redirect to="/"/>

export default WebApp;