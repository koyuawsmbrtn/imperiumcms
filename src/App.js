import React, { Component } from 'react';
import Navigation from './Navigation';
import Main from './Main';
import Footer from './Footer';
import './App.css';
import $ from 'jquery';
import * as config from './params.json';

class App extends Component {
  componentDidMount() {
    //Hide login form
    $(".login").hide();

    //Get app name from API or read config if backend is down
    $.getJSON(config["api"] + "/api/v1/config", function(data) {
      document.title = data["appname"];
    }).fail(function() {
      document.title = config["appname"];
      //Show error if backend can't be reached and disable access to website
      $(".errorbackend").show();
      $("a").attr("href", ""); //Disable all links to be completely sure
    });

    $(".admin").hide();
    $(".partner").hide();

    //Login form
    if (window.location.href.indexOf("/admin") > -1) {
      if (localStorage.getItem("sessionid") === null || localStorage.getItem("username") === null) {
        //Show login form if user is logged out
        $(".home").hide();
        $(".login").show();
      } else {
        $(".home").hide();
        $(".login").hide();
        //First we verify the session and then show a different panel per role
        $.getJSON(config["api"] + "/api/v1/verify/session/" + localStorage.getItem("username") + "/" + localStorage.getItem("sessionid"), function(d1) {
          if (d1["verified"] === "true") {
            $.getJSON(config["api"] + "/api/v1/get/role/" + localStorage.getItem("username") + "/" + localStorage.getItem("sessionid"), function(d2) {
              $("." + d2["role"]).show();
            });
          } else {
            //Clear everything on error
            localStorage.clear();
            window.location.reload();
          }
        });
      }
    }
  }
  render() {
    return (
      //Render App
      <div className="App">
        <Navigation />
        <Main />
        <Footer />
      </div>
    );
  }
}

export default App;
