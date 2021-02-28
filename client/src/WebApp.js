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
            <Route exact path = "/main" component = {App} /> {/*기존의 출석 화면*/}
            <Route exact path = "/" component = {LoginPage} />{/*로그인 화면*/}
        </Switch>
      </div>
    </Router>
  )};
}



export default WebApp;