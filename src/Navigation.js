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

      //Set titles for Navigation.js (using content API)
      $.get(config["api"] + "/api/v1/content/about", function(data) {
        $(".link-about").html(decodeHtmlEntity(data).split("\n")[0].replace("<h1>", "").replace("</h1>", ""));
      });
      $.get(config["api"] + "/api/v1/content/s2", function(data) {
        $(".link-s2").html(decodeHtmlEntity(data).split("\n")[0].replace("<h1>", "").replace("</h1>", ""));
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
              <NavItem>
                <NavLink className="link-about" href="/about">Über <span className="app-name">app</span></NavLink>
              </NavItem>
              <NavItem>
                <NavLink style={{display: "none"}} className="link-access" href="/access">Administration</NavLink>
              </NavItem>
              <NavItem>
                <NavLink className="link-s2" href="/s2">Sample Page</NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Navbar>
      </div>
    );
  }
}