import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Redirect } from "react-router-dom";
import './SignIn.css';
import Home from './Home';
import {PrivateRoute} from '../App';

export default class SignIn extends Component {
  constructor(props){
    super(props);
    this.state = {
    }

    this.Authentication = this.Authentication.bind(this);
  }

  render() {
    return (
      <div className="Signin">
      <div className="Signin__Form">
      <h4>Введите учетные данные</h4>
      <label className="Signin__Label">Пользователь:</label><input id="Login" placeholder="Логин" className="Signin__input" autoComplete="off"></input>
      <label className="Signin__Label">Пароль:</label><input id="Password" type="password" placeholder="Пароль" className="Signin__input" autoComplete="off"></input>
      <div className="Signin__button" onClick={this.Authentication}>Войти</div>
      </div>
      </div>      
    );
  }

  Authentication(){
    let login = document.getElementById("Login").value;
    let pass = document.getElementById("Password").value;
    
    if(login === "Anvar" && pass === "Hello")
      return <Redirect push to='/home'/>
  }

}
