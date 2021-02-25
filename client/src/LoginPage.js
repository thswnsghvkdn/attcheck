import axios from "axios";
import React from "react";
import { Redirect, useHistory } from 'react-router-dom'
//!this.isLogin && <Redirect to="/"/>
class LoginPage extends React.Component{
    userID;
    password;

    onSubmitHandler = (event) =>{
        event.preventDefault();
        axios.post('/api/users/login', {name : this.userID , password : this.password} ).then(res =>{
            if(res.login === "true") console.log("성공");
            this.props.history.push("/main");
        })
    }

    
    render = () =>{
        return (
            <div style = {{
                display : 'flex', justifyContent : 'center' , alignItems : 'center'
                , width : '100%' , height : '100vh'
            }}>
                <form style = {{display : 'flex' , flexDirection : 'column'}}  onSubmit = {this.onSubmitHandler} >
                    <label>userID</label>
                    <input type = "text" onChange = { function(e){ this.userID = e.target.value}.bind(this) } />
                    <label>password</label>
                    <input type = "password" onChange = {function(e){this.password = e.target.value}.bind(this)} />
                    <br />
                    <button>Login</button>                    
                </form>
            </div>
        );}
}

export default LoginPage;