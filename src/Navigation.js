import React from 'react';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  } from 'reactstrap';
import $ from 'jquery';
import * as config from './params.json';

export default class Navigation extends React.Component {
  //Mobile toggle handling
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false
    };
  }
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }
  componentDidMount() {
      var decodeHtmlEntity = function(str) {
        return str.replace(/&#(\d+);/g, function(match, dec) {
          return String.fromCharCode(dec);
        });
      };

      //Show different pages depending on the URL
      if (window.location.href.indexOf("/about") > -1) {
        $.get(config["api"] + "/api/v1/content/about", function (data) {
          $(".jumbotron").html(decodeHtmlEntity(data));
        });
      }
      if (window.location.href.indexOf("/s2") > -1) {
        $.get(config["api"] + "/api/v1/content/s2", function (data) {
          $(".jumbotron").html(decodeHtmlEntity(data));
        });
      }

      if (window.location.href.indexOf("/privacy") > -1) {
        $.get(config["api"] + "/api/v1/content/privacy", function (data) {
          $(".jumbotron").html(decodeHtmlEntity(data));
        });
      }

      if (window.location.href.indexOf("/imprint") > -1) {
        $.get(config["api"] + "/api/v1/content/imprint", function (data) {
          $(".jumbotron").html(decodeHtmlEntity(data));
        });
      }

      //Also set the app name from the API, otherwise read the config file
      $.getJSON(config["api"] + "/api/v1/config", function(data) {
        $(".app-name").html(data["appname"]);
      }).fail(function() {
        $(".app-name").html(config["appname"]);
      });

      $.getJSON(config["api"] + "/api/v1/get/pages", function(data) {
        $(".navbar-nav").html("");
        data.forEach(function(i) {
          $.get(config["api"] + "/api/v1/content/" + i, function(data2) {
            if (i !== "privacy" && i !== "imprint" && i !== "terms" && i !== "home") {
              $(".navbar-nav").append("<li class=\"nav-item\"><a href=\"/" + i + "\" class=\"" + i + "-text nav-link\"></a></li>");
              $("." + i + "-text").html(decodeHtmlEntity(data2).split("\n")[0].replace("<h1>", "").replace("</h1>", ""));
            }
          });
        });
      });
  }
  render() {
    return (
      //And this just renders the navigation
      //Pretty basic bootstrap
      <div>
        <Navbar color="white" light expand="md">
          <NavbarBrand href="/" className="link-appname"><span className="app-name"></span></NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav navbar>
              <ul class="navbar-nav">
              
              </ul>
            </Nav>
          </Collapse>
        </Navbar>
      </div>
    );
  }
}