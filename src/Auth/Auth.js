// src/Auth/Auth.js

import auth0 from 'auth0-js';
import store from 'index';
import history from '../history';
import * as ui from '../state/ui/actions'


export default class Auth {

   auth1 : WebAuth ;


  setConfig(config)
  {
     this.auth1 = new auth0.WebAuth(config)
  }

  login() {
     // console.log("auth1",this.auth1,auth0)
    this.auth1.authorize();
  }

  constructor() {
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
    /*
    this.auth1 = new auth0.WebAuth({
     "domain": "bdrc-io.auth0.com",
     "clientID": "q1YsWjfmP37r8TspUOIqLF5l9Phw9QQY",
     "redirectUri": "http://localhost:3000/callback",
     "audience": "https://bdrc-io.auth0.com/userinfo",
     "responseType": "token id_token",
     "scope": "openid"
    });
    */
    this.setConfig.bind(this)
  }

  handleAuthentication() {
    this.auth1.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
        history.replace('/');
        store.dispatch(ui.loggedIn())
      } else if (err) {
        history.replace('/');
        console.log(err);
      }
    });
  }

  setSession(authResult) {
    // Set the time that the Access Token will expire at
    let expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
    // navigate to the home route
    history.replace('/');
  }

  logout() {
    // Clear Access Token and ID Token from local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    // navigate to the home route
    history.replace('/');
    store.dispatch(ui.loggedOut())
  }

  isAuthenticated() {
    // Check whether the current time is past the
    // Access Token's expiry time
    let expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  }
}
