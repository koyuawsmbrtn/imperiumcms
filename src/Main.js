import React from 'react';
import { Alert, Jumbotron, Input, Button, Label, FormGroup } from 'reactstrap';
import Login from './Login';
import $ from 'jquery';
import md5 from 'md5';
import * as config from './params.json';
import ReactQuill from 'react-quill';

export default class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true
    };

    this.onDismiss = this.onDismiss.bind(this);
  }

  onDismiss() {
    this.setState({ visible: false });
  }

  componentDidMount() {
    var encodeHtmlEntity = function(str) {
      var buf = [];
      for (var i=str.length-1;i>=0;i--) {
        buf.unshift(['&#', str[i].charCodeAt(), ';'].join(''));
      }
      return buf.join('');
    };

    var decodeHtmlEntity = function(str) {
      return str.replace(/&#(\d+);/g, function(match, dec) {
        return String.fromCharCode(dec);
      });
    };

    $("#backbutton").hide();

    $(".errorbackend").hide();
    $(".errorlogin").hide();
    $(".success").hide();
    $(".error").hide();
    $("#restart").hide();
    $("#stop").hide();
    $("#adduser").hide();
    $("#deluser").hide();
    $(".deluser-panel").hide();
    $(".adduser-panel").hide();
    $(".pages-panel").hide();
    $(".login-frontend").click(function() {
      //console.log("login!");
    });

    //Page titles
    /*
    $.get(config["api"] + "/api/v1/content/s2", function(data) {
      $(".s2-text").html(decodeHtmlEntity(data).split("\n")[0].replace("<h1>", "").replace("</h1>", ""));
    });
    $.get(config["api"] + "/api/v1/content/about", function(data) {
      $(".about-text").html(decodeHtmlEntity(data).split("\n")[0].replace("<h1>", "").replace("</h1>", ""));
    });
    $.get(config["api"] + "/api/v1/content/privacy", function(data) {
      $(".privacy-text").html(decodeHtmlEntity(data).split("\n")[0].replace("<h1>", "").replace("</h1>", ""));
    });
    $.get(config["api"] + "/api/v1/content/imprint", function(data) {
      $(".imprint-text").html(decodeHtmlEntity(data).split("\n")[0].replace("<h1>", "").replace("</h1>", ""));
    });
    $.get(config["api"] + "/api/v1/content/home", function(data) {
      $(".home-text").html(decodeHtmlEntity(data).split("\n")[0].replace("<h1>", "").replace("</h1>", ""));
    });*/

    $.getJSON(config["api"] + "/api/v1/get/pages", function(data) {
      $("#select-page").html("<option></option>");
      data.forEach(function(i) {
        $.get(config["api"] + "/api/v1/content/" + i, function(data2) {
          $("#select-page").append("<option value=\"" + i + "\" class=\"" + i + "-text\"></option>");
          $("." + i + "-text").html(decodeHtmlEntity(data2).split("\n")[0].replace("<h1>", "").replace("</h1>", ""));
        });
      });
    });

    $(".username").html(localStorage.getItem("username"));
    var role = null;
    $.getJSON(config["api"] + "/api/v1/verify/session/" + localStorage.getItem("username") + "/" + localStorage.getItem("sessionid"), function(d1) {
      if (d1["verified"] === "true") {
        $.getJSON(config["api"] + "/api/v1/get/role/" + localStorage.getItem("username") + "/" + localStorage.getItem("sessionid"), function(d2) {
          role = d2["role"];
          if (role === "admin") {
            $(".role").html("Administrator")
          } else if (role === "god") {
            $(".role").html("God");
            $("#restart").show();
            $("#stop").show();
          } else if (role === "partner") {
            $(".role").html("Partner");
            $("#adduser").hide();
            $("#deluser").hide();
          } else {
            $(".role").html("User");
            $("#adduser").hide();
            $("#deluser").hide();
          }
          if (role === "god" || role === "admin") {
            $("#adduser").show();
            $("#deluser").show();
          }
        });
      }
    });

    $("#logout").click(function() {
      $.getJSON(config["api"] + "/api/v1/destroy/session/" + localStorage.getItem("username") + "/" + localStorage.getItem("sessionid"), function(data) {
        console.log(data);
        if (data["destroyed"] === "true") {
          localStorage.clear();
          localStorage.setItem("success", true);
          window.location.reload();
        }
      });
    });

    $("#restart").click(function() {
      $.getJSON(config["api"] + "/api/v1/server/restart/" + localStorage.getItem("username") + "/" + localStorage.getItem("sessionid"), function(data) {
        //Server restarts
      });
    });

    $("#stop").click(function() {
        $.getJSON(config["api"] + "/api/v1/server/stop/" + localStorage.getItem("username") + "/" + localStorage.getItem("sessionid"), function(data) {
          //Server stops
        });
    })

    //If deluser has been clicked
    $("#deluser").click(function() {
      //We assume the deleted user is not the own user
      var ownuser = false;
      if ($("#username-deluser").val() === localStorage.getItem("username")) {
        //If so then we're doomed (you'll get to know later why)
        ownuser = true;
      }

      //Request user deletion to the API
      $.getJSON(config["api"] + "/api/v1/user/del/" + localStorage.getItem("username") + "/" + localStorage.getItem("sessionid") + "/" + $("#username-deluser").val(), function(data) {
        try {
          //If backend said deletion was successful
          if (data["status"] === "success") {
            //Hide everything
            $(".deluser-panel").hide();
            if (ownuser === false) {
              //and if it wasn't the owner, well...
              $("." + role).show();
              localStorage.setItem("success", "true");
              window.location.reload();
              //we had luck. Very much of it.
            } else {
              //Otherwise kill everything and reload like a hitman
              localStorage.clear();
              localStorage.setItem("success", true);
              $.getJSON(config["api"] + "/api/v1/destroy/session/" + localStorage.getItem("username") + "/" + localStorage.getItem("sessionid"), function(data) { });
              window.location.reload();
            }
          }
        } catch (e) {
          /*And if everything falls together and your boss is about to fire you
          then we calm everyone down with an error message*/
          localStorage.setItem("error", "true");
          window.location.reload();
        }
      });
    });

    //If adduser has been clicked
    $("#adduser").click(function() {
      $.getJSON(config["api"] + "/api/v1/user/add/" + localStorage.getItem("username") + "/" + localStorage.getItem("sessionid") + "/" + $("#role-adduser").val() + "/" + $("#username-adduser").val() + "/" + md5($("#password-adduser").val()) + "/" + $("#email-adduser").val(), function(data) {
        try {
          if (data["status"] === "success") {
            localStorage.setItem("success", "true");
            window.location.reload();
          }
        } catch (e) {
          localStorage.setItem("error", "true");
          window.location.reload();
        }
      });
    });

    //Hide everything and show deluser panel if onclick event on deluser-button has been triggered
    $("#deluser-button").click(function() {
      $("." + role).hide();
      $(".deluser-panel").show();
    });

    //Hide everything and show adduser panel if onclick event on adduser-button has been triggered
    $("#adduser-button").click(function() {
      $("." + role).hide();
      $(".adduser-panel").show();
    });

    //If success state has been reached
    if (localStorage.getItem("success") === "true") {
      $(".success").show();
      localStorage.setItem("success", "false");
    }

    //If error state has been reached
    if (localStorage.getItem("error") === "true") {
      $(".error").show();
      localStorage.setItem("error", "false");
    }
    
    //If enter has been pressed on username-deluser input field
    $("#username-deluser").keypress(function (e) {
      if (e.which === 13) {
        $("#deluser").click();
        return false;
      }
    });

    $("#pages-button").click(function() {
      $("." + role).hide();
      $(".pages-panel").show();
    });

    $("#select-page").change(function() {
      $.get(config["api"] + "/api/v1/content/" + $("#select-page").val(), function(data) {
        $("#title-page").attr("value", decodeHtmlEntity(data).split("\n")[0].replace("<h1>", "").replace("</h1>", ""));
        $(".ql-editor").html(decodeHtmlEntity(data).split("\n").slice(1).join("\n"));
      }).fail(function() {
        $("#title-page").attr("value", "");
        $(".ql-editor").html("");
      });
    });

    $("#submit-page").click(function() {
      $.post(config["api"] + "/api/v1/change/page/" + localStorage.getItem("username") + "/" + localStorage.getItem("sessionid") + "/" + $("#select-page").val() + "/" + $("#title-page").val(), {content: encodeHtmlEntity($(".ql-editor").html())}, function(data) {
        if (data["changed"] === "true") {
          localStorage.setItem("success", "true");
          window.location.reload();
        }
      })
    });

    //Get home page
    $.get(config["api"] + "/api/v1/content/home", function(data) {
      $(".home").html(decodeHtmlEntity(data));
    })

    $("button").click(function() {
      //Display back button if lost
      var attr = $(".user").attr("display");
      console.log(attr);
      if (window.location.href.indexOf("/access") > -1) {
        $("#backbutton").show();
      } else {
        $("#backbutton").hide();
      }
    })

    //Handle back button
    $("#backbutton").click(function() { window.location.reload(); })

    var currentPage = window.location.href.split("/")[3]
    if (currentPage !== "" && currentPage !== "access") {
      $.get(config["api"] + "/api/v1/content/" + window.location.href.split("/")[3], function(data) {
        $(".jumbotron").html(data);
      });
    }
    if (currentPage === "") {
      $.get(config["api"] + "/api/v1/content/home", function(data) {
        $(".jumbotron").html(data);
      });
    }
  }

  render() {
    return (
      //Render main class
      <div className="container">
        <Alert color="danger" className="errorbackend">
          Error while trying to connect to backend. Is the backend server running?
        </Alert>
        <Jumbotron>
          <Alert color="success" isOpen={this.state.visible} toggle={this.onDismiss} className="success">
                Success!
          </Alert>
          <Alert color="danger" isOpen={this.state.visible} toggle={this.onDismiss} className="error">
                Error!
          </Alert>
          <div className="home">
          </div>
          <div className="login">
            <Alert color="danger" isOpen={this.state.visible} toggle={this.onDismiss} className="errorlogin">
            User couldn't be authenticated. Is the username and/or password correct?
            </Alert>
            <h1>Anmelden</h1><br />
            <Login />
          </div>
          <div className="admin partner user god">
            <h1>Welcome <span className="username"></span>!</h1>
            <p>You are <span className="role"></span>.</p>
            <div className="god admin">
            <p><Button id="pages-button">Pages</Button></p>
            <p><Button id="adduser-button">Add user</Button></p>
            <p><Button id="deluser-button">Delete User</Button></p>
            </div>
            <div className="god">
            <p><Button id="restart">Restart server</Button></p>
            <p><Button id="stop">Stop server</Button></p>
            </div>
            <p><Button id="logout" color="primary">Logout</Button></p>
          </div>
          <div className="deluser-panel">
            <h1>Delete user</h1>
            <FormGroup row>
              <Label for="username-deluser">User to delete</Label>
              <Input type="text" name="username" id="username-deluser" />
            </FormGroup>
            <Button color="danger" id="deluser">Delete user</Button>
          </div>
          <div className="adduser-panel">
            <h1>Add user</h1>
            <FormGroup row>
              <Label for="username-adduser">Username</Label>
              <Input type="text" name="username" id="username-adduser" />
            </FormGroup>
            <FormGroup row>
              <Label for="password-adduser">Password</Label>
              <Input type="password" name="password" id="password-adduser" />
            </FormGroup>
            <FormGroup row>
              <Label for="email-adduser">E-mail</Label>
              <Input type="email" name="email" id="email-adduser" />
            </FormGroup>
            <FormGroup row>
              <Label for="role-adduser">Role</Label>
              <Input type="select" id="role-adduser">
                <option value="user">User</option>
                <option value="partner">Partner</option>
                <option value="admin">Administrator</option>
                <option value="god">God</option>
              </Input>
            </FormGroup>
            <Button id="adduser" color="primary">Add user</Button>
          </div>
          <div className="pages-panel">
            <h1>Edit page</h1>
            <FormGroup row>
              <Label for="select-page">Choose Page</Label>
              <Input type="select" name="select-page" id="select-page">
                
              </Input>
            </FormGroup>
            <FormGroup row>
              <Label for="title-page">Title</Label>
              <Input name="title-page" id="title-page"></Input>
            </FormGroup>
            <FormGroup>
              <br />
              <ReactQuill value={this.state.text} />
            </FormGroup>
            <Button color="primary" id="submit-page">Update page</Button>
          </div>
          <div><br /><Button id="backbutton">Back</Button></div>
        </Jumbotron>
      </div>
    );
  }
}