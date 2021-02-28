import axios from "axios";
import React from "react";
import { Redirect, useHistory } from 'react-router-dom'
//!this.isLogin && <Redirect to="/"/>
class LoginPage extends React.Component{
    userID;
    password;
    constructor(props){
        super(props);
        axios.get('/api/users/auth').then(response =>{
            if(response.data.login === "true")
            {
                this.props.history.push("/main"); // 로그인이 성공할 경우 출석페이지로 이동시킨다.
            }
        })
    }

    onSubmitHandler = (event) =>{
        event.preventDefault();
        // 서버에 아이디와 비밀번호를 보낸다.
        axios.post('/api/users/login', {name : this.userID , password : this.password} ).then(res =>{
            if(res.data.login === "true") {
                console.log("성공");
                this.props.history.push("/main"); // 로그인이 성공할 경우 출석페이지로 이동시킨다.
            }
            else alert("로그인 실패");
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