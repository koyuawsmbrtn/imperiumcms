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
    // eslint-disable-next-line
    String.prototype.replaceAll = function(search, replacement) {
      var target = this;
      return target.replace(new RegExp(search, 'g'), replacement);
    };

    $(".admin-panel").hide();
    $("#backbutton").hide();

    $(".errorbackend").hide();
    $(".errorlogin").hide();
    $(".success").hide();
    $(".error").hide();
    $("#adduser").hide();
    $("#deluser").hide();
    $(".deluser-panel").hide();
    $(".adduser-panel").hide();
    $(".pages-panel").hide();
    $("#delpage").hide();
    $(".deletepage-panel").hide();
    $(".css-panel").hide();
    $("#css-button").hide();
    $(".upload-panel").hide();
    $("#upload-button").hide();
    $(".images-panel").hide();
    $("#images-button").hide();
    $(".advanced-panel").hide()
    $("#advanced-button").hide();
    $(".about-panel").hide();

    $(".metadata-warning button").click(function() {
      void(0);
      $(".metadata-warning").hide();
      localStorage.setItem("metadata-warning-display", "false");
    });

    $(".profile-picture").click(function() {
      $(".panel").hide();
      $(".front-panel").show();
    });

    // https://stackoverflow.com/a/6660151 because I suck
    function stripscripts(s) {
      var div = document.createElement('div');
      div.innerHTML = s;
      var scripts = div.getElementsByTagName('script');
      var i = scripts.length;
      while (i--) {
        scripts[i].parentNode.removeChild(scripts[i]);
      }
      return div.innerHTML;
    }

    function toggleeditor() {
      if (localStorage.getItem("editor-type") === "visual") {
        $("#page-editor-html").val($(".ql-editor").html());
        localStorage.setItem("editor-type", "html");
        if ($("#page-editor-html").val() === "<p><br></p>") {
          $("#page-editor-html").val("");
        }
      } else {
        $(".ql-editor").html(stripscripts($("#page-editor-html").val()));
        localStorage.setItem("editor-type", "visual");
      }
    }

    function rendereditor() {
      if (localStorage.getItem("editor-type") === "visual") {
        $("#page-editor-visual").show();
        $("#page-editor-html").hide();
      } else {
        $("#page-editor-visual").hide();
        $("#page-editor-html").show();
      }
    }

    rendereditor();

    $("#page-editor-html").keypress(function() {
      var extracss = "";
      if ($("#page-editor-html").attr("style") === "display: none;") {
        extracss = "display: none;"
      }
      $("#page-editor-visual").show();
      $("#page-editor-html").css(extracss + "height:" + $(".page-editor-visual").height() + "px;");
      $("#page-editor-visual").hide();
      $("#page-editor-html").val($("#page-editor-html").val().replaceAll("<p>\n</p>", "\n<br>\n"));
    });

    //Page selection
    $.getJSON(config["api"] + "/api/v1/get/pages", function(data) {
      $(".pageselector").html("<option></option>");
      data.forEach(function(i) {
        $.get(config["api"] + "/api/v1/content/" + i, function(data2) {
          if (data2.split("\n")[0].replace("<h1>", "").replace("</h1>", "") !== "") {
            $(".pageselector").append("<option value=\"" + i + "\" className=\"" + i + "-text\">" + data2.split("\n")[0].replace("<h1>", "").replace("</h1>", "") + "</option>");
          }
        });
      });
    });

    $(".username").html(localStorage.getItem("username"));
    var role = null;
    $.getJSON(config["api"] + "/api/v1/verify/session/" + localStorage.getItem("username") + "/" + localStorage.getItem("sessionid"), function(d1) {
      if (d1["verified"] === "true") {
        $.get(config["api"] + "/api/v1/get/email/" + localStorage.getItem("username") + "/" + localStorage.getItem("sessionid"), function(data) {
          $.get("https://www.gravatar.com/avatar/" + md5(data["email"]) + "?d=404&s=128", function() {
            $(".profile-picture").attr("src", "https://www.gravatar.com/avatar/" + md5(data["email"]) + "?d=404&s=128");
          });
        });
        $.get(config["api"] + "/img/ppic-" + localStorage.getItem("username") + ".jpg", function() {
          $(".profile-picture").attr("src", config["api"] + "/img/ppic-" + localStorage.getItem("username") + ".jpg")
        });
        if (window.location.href.indexOf("/admin") > -1) {
          $(".jumbotron").hide();
          $(".admin-panel").show();
        }
        $.getJSON(config["api"] + "/api/v1/get/role/" + localStorage.getItem("username") + "/" + localStorage.getItem("sessionid"), function(d2) {
          role = d2["role"];
          if (role === "admin") {
            $(".role").html("Administrator")
          } else if (role === "god") {
            $(".role").html("God");
          } else if (role === "partner") {
            $(".role").html("Partner");
            $("#adduser").hide();
            $("#deluser").hide();
            $("#adduser-button").hide();
            $("#deluser-button").hide();
          } else if (role === "author") {
            $(".role").html("Author");
            $("#adduser").hide();
            $("#deluser").hide();
            $("#delpage").show();
            $("#delpage-button").show();
            $("#adduser-button").hide();
            $("#deluser-button").hide();
            $("#upload-button").show();
            $("#images-button").show();
          } else {
            $(".role").html("User");
            //Might hide everything now
          }
          if (role === "god" || role === "admin") {
            $("#delpage").show();
            $("#delpage-button").show();
            $("#adduser").show();
            $("#deluser").show();
            $("#css-button").show();
            $("#upload-button").show();
            $("#images-button").show();
            $("#advanced-button").show();
          }
        });
      }
    });

    $("#advanced-button").click(function() {
      $(".panel").hide();
      $(".advanced-panel").show();
      $("#sitename-field").val(document.title);
    });

    $("#advanced-submit").click(function() {
      var confv = "{\n\"appname\": \"" + $("#sitename-field").val() + "\",\n\"api\": \"" + config["api"] + "\"\n}";
      $.post(config["api"] + "/api/v1/change/config/" + localStorage.getItem("username") + "/" + localStorage.getItem("sessionid"), {config: confv}, function(data) {
        if (data["status"] === "success") {
          localStorage.setItem("success", "true");
          window.location.reload();
        } else {
          localStorage.setItem("error", "true");
        }
      });
    });

    $("#images-button").click(function() {
      $(".panel").hide();
      $(".images-panel").show();
      $.get(config["api"] + "/api/v1/get/images", function(data) {
        var arr = data.split("\n");
        $(".image-library").html("");
        arr.forEach(function (i) {
          if (i !== "") {
            $(".image-library").append("<a href=\"javascript:delimg('" + i + "');\"><img class=\"" + i.split(".")[0] +"\" src=\"" + config["api"] + "/img/" + i + "\" style=\"cursor:pointer;\" width=\"300\"></a><br>\n");
          }
        });
      });
    });

    $("#page-toggle-editor").click(function() {
      toggleeditor();
      rendereditor();
    });

    $("#logout").click(function() {
      $.getJSON(config["api"] + "/api/v1/destroy/session/" + localStorage.getItem("username") + "/" + localStorage.getItem("sessionid"), function(data) {
        if (data["destroyed"] === "true") {
          localStorage.clear();
          localStorage.setItem("success", true);
          window.location.reload();
        }
      });
    });

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
      $(".panel").hide();
      $(".deluser-panel").show();
    });

    //Hide everything and show adduser panel if onclick event on adduser-button has been triggered
    $("#adduser-button").click(function() {
      $(".panel").hide();
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

    $("#css-button").click(function() {
      $(".panel").hide();
      $.getJSON(config["api"] + "/api/v1/get/role/" + localStorage.getItem("username") + "/" + localStorage.getItem("sessionid"), function(d2) {
        role = d2["role"];
        $(".css-panel").show();
      });
      $.get(config["api"] + "/api/v1/get/css", function(data) {
        $("#css-textbox").val(data);
      });
    });

    $("#pages-button").click(function() {
      $(".panel").hide();
      $.getJSON(config["api"] + "/api/v1/get/role/" + localStorage.getItem("username") + "/" + localStorage.getItem("sessionid"), function(d2) {
        role = d2["role"];
        $(".pages-panel").show();
      });
    });

    $("#select-page").change(function() {
      $.get(config["api"] + "/api/v1/content/" + $("#select-page").val(), function(data) {
        $("#title-page").val(data.split("\n")[0].replace("<h1>", "").replace("</h1>", ""));
        $(".ql-editor").html(stripscripts(data.split("\n").slice(1).join("\n")));
        $("#permalink").html($("#select-page").val());
        $("#page-editor-html").val($(".ql-editor").html().replaceAll("<p><br></p>", ""));
        rendereditor();
      }).fail(function() {
        $("#title-page").val("");
        $("#permalink").html($("#select-page").val());
        $(".ql-editor").html("");
        rendereditor();
      });
    });

    if (localStorage.getItem("editor-type", "html")) {
      $("#page-editor-html").val("");
    }

    $("#title-page").keyup(function() {
      if ($("#select-page").val() === "") {
        $("#permalink").html($("#title-page").val().replace(/[^a-zA-Z ]/g, "").split(" ").join("-").toLowerCase());
      }
    });

    $("#submit-page").click(function() {
      if ($("#page-editor-html").val() !== "<p><br></p>" && localStorage.getItem("editor-type") === "html") {
        $(".ql-editor").html($("#page-editor-html").val().replaceAll("\n<br>", ""));
      }
      $.post(config["api"] + "/api/v1/change/page/" + localStorage.getItem("username") + "/" + localStorage.getItem("sessionid") + "/" + $("#permalink").html() + "/" + $("#title-page").val(), {content: $(".ql-editor").html()}, function(data) {
        if (data["changed"] === "true") {
          localStorage.setItem("success", "true");
          window.location.reload();
        }
      })
    });

    $("#css").click(function() {
      $.post(config["api"] + "/api/v1/change/css/" + localStorage.getItem("username") + "/" + localStorage.getItem("sessionid"), {css: $("#css-textbox").val()}, function(data) {
        if (data["status"] === "success") {
          localStorage.setItem("success", "true");
          window.location.reload();
        }
      })
    });

    //Get home page
    $.get(config["api"] + "/api/v1/content/home", function(data) {
      $(".home").html(data);
    })

    $(".btn").click(function() {
      //Display back button if lost
      if (window.location.href.indexOf("/admin") > -1) {
        $("#backbutton").show();
      } else {
        $("#backbutton").hide();
      }
    })

    //Handle back button
    $("#backbutton").click(function() {
      $(".panel").hide();
      $("#backbutton").hide();
    });

    var currentPage = window.location.href.split("/")[3]
    var page404 = '<head><title>app</title><meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no"/> <style> a { color: #007bff; text-decoration: none; background-color: transparent;} a:hover { color: #0056b3; text-decoration: underline; } body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif; cursor: default; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; } main, aside, section { display: flex; justify-content: center; align-items: center; flex-direction: column; } main { height: 100%; } aside { background: #000; flex-shrink: 1; padding: 30px 20px; } aside p { margin: 0; color: #999999; font-size: 14px; line-height: 24px; } aside a { color: #fff; text-decoration: none; } section span { font-size: 24px; font-weight: 500; display: block; border-bottom: 1px solid #EAEAEA; text-align: center; padding-bottom: 20px; width: 100px; } section p { font-size: 14px; font-weight: 400; } section span + p { margin: 20px 0 0 0; } @media (min-width: 768px) { section { height: 40px; flex-direction: row; margin-top: 42vh; } section span, section p { height: 100%; line-height: 40px; } section span { border-bottom: 0; border-right: 1px solid #EAEAEA; padding: 0 20px 0 0; width: auto; } section span + p { margin: 0; padding-left: 20px; } aside { padding: 50px 0; } aside p { max-width: 520px; text-align: center; } } </style></head><body> <main> <section> <span>404</span> <p>The requested path could not be found</p> </section> </main> <br> <br> <div style="display:block;text-align:center;"><a href="/">&larr; Back to homepage</a></div></body>';
    if (currentPage !== "" && currentPage !== "admin" && currentPage !== "dashboard") {
      $.get(config["api"] + "/api/v1/content/" + window.location.href.split("/")[3], function(data) {
        $(".jumbotron").html(data);
        var title = data.split("\n")[0].replaceAll("<h1>", "").replaceAll("</h1>", "");
        $.getJSON(config["api"] + "/api/v1/config", function(data) {
          document.title = title + " - " + data["appname"];
        }).fail(function() {
          document.title = config["appname"];
          $(".errorbackend").show();
          $("a").attr("href", "");
        });
      }).fail(function() {
        $("html").html(page404);
        $.getJSON(config["api"] + "/api/v1/config", function(data) {
          document.title = "404 - " + data["appname"];
        }).fail(function() {
          document.title = config["appname"];
          $(".errorbackend").show();
          $("a").attr("href", "");
        });
      });
    }
    if (currentPage === "dashboard") {
      $("html").html(page404);
      $.getJSON(config["api"] + "/api/v1/config", function(data) {
        document.title = "404 - " + data["appname"];
      }).fail(function() {
        document.title = config["appname"];
        $(".errorbackend").show();
        $("a").attr("href", "");
      });
    }

    if (currentPage === "") {
      $.get(config["api"] + "/api/v1/content/home", function(data) {
        $(".jumbotron").html(data);
        $.getJSON(config["api"] + "/api/v1/config", function(data) {
          document.title = data["appname"];
        }).fail(function() {
          document.title = config["appname"];
          $(".errorbackend").show();
          $("a").attr("href", "");
        });
      }).fail(function() {
        $("html").html(page404);
      });
    }

    $("#delpage-button").click(function() {
      $(".panel").hide();
      $.getJSON(config["api"] + "/api/v1/get/role/" + localStorage.getItem("username") + "/" + localStorage.getItem("sessionid"), function(d2) {
        role = d2["role"];
        $(".deletepage-panel").show();
      });
    });

    $("#delpage").click(function() {
      $.post(config["api"] + "/api/v1/delete/page/" + localStorage.getItem("username") + "/" + localStorage.getItem("sessionid") + "/" + $("#select-delpage").val(), function(data) {
        if (data["deleted"] === "true") {
          localStorage.setItem("success", "true");
          window.location.reload()
        } else {
          localStorage.setItem("error", "true");
          window.location.reload();
        }
      }).fail(function() {
        localStorage.setItem("error", "true");
        window.location.reload();
      });
    });

    $("#upload-button").click(function() {
      $(".panel").hide();
      $(".upload-panel").show();
    });

    $('#upload-submit').on('click', function (event) {
      var formData = new FormData();
      formData.append('data', $("#upload-field")[0].files[0]);
      $.ajax(config["api"] + "/api/v1/upload/" + localStorage.getItem("username") + "/" + localStorage.getItem("sessionid"), {
          type: 'POST',
          contentType: false,
          processData: false,
          data: formData,
          error: function() {
            localStorage.setItem("error", "true");
            window.location.reload();
          },
          success: function(res) {
            if (res["status"] === "success") {
              $("#upload-field").val("");
            }
        }
      });
    });

    $("#about-button").click(function() {
      $(".panel").hide();
      $.get(config["api"] + "/api/v1/config", function (data) {
        $(".about-container").html("<p><img src=\"" + config["api"] + "/logo\" alt=\"Logo\" id=\"about-logo\"><br>This is ImperiumCMS version " + data["version"] + ".<br>ImperiumCMS is <a href=\"https://git.koyu.space/koyu/imperiumcms\" target=\"_blank\">open-source</a> software written in React and Python.<br>You are running release <code>" + data["release"] + "</code>.");
      });
      $(".about-panel").show();
    });

    $.get(config["api"] + "/api/v1/get/dashboard/" + localStorage.getItem("username") + "/" + localStorage.getItem("sessionid"), function(data) {
      $(".front-panel").html(data);
    });
    $("body").show();
  }

  render() {
    return (
      //Render main class
      <div className="container">
        <Alert color="danger" className="errorbackend">
          Error while trying to connect to backend. Is the backend server running?
        </Alert>
        {/*
        User Profile Sidebar by @keenthemes
        A component of Metronic Theme - #1 Selling Bootstrap 3 Admin Theme in Themeforest: http://j.mp/metronictheme
        Licensed under MIT
        */}
        <div className="admin-panel">
            <div className="row profile">
            <div className="col-md-3">
              <div className="profile-sidebar">
                <div className="profile-userpic">
                  <img src={config["api"] + "/blank-user"} className="profile-picture" alt="" style={{cursor: "pointer"}} />
                </div>
                <div className="profile-usertitle">
                  <div className="profile-usertitle-name">
                    <span className="username"></span>
                  </div>
                  <div className="profile-usertitle-job">
                    <span className="role"></span>
                  </div>
                </div>
                <div className="profile-usermenu text-center">
                  <div className="author god admin">
                    <p><Button id="pages-button">Edit/New Page</Button></p>
                    <p><Button id="delpage-button">Delete page</Button></p>
                    <p><Button id="upload-button">Upload image</Button></p>
                    <p><Button id="images-button">Image library</Button></p>
                  </div>
                  <div className="admin god">
                    <p><Button id="adduser-button">Add user</Button></p>
                    <p><Button id="deluser-button">Delete User</Button></p>
                    <p><Button id="css-button">Custom CSS</Button></p>
                    <p><Button id="advanced-button">Advanced Settings</Button></p>
                    <p><Button id="about-button">About</Button></p>
                  </div>
                  <p><Button id="logout" color="primary">Logout</Button></p>
                </div>
              </div>
            </div>
            <div className="col-md-9">
                    <div className="profile-content">
                      <div className="front-panel panel">
                        
                      </div>
                      <div className="deluser-panel panel">
                        <h1>Delete user</h1>
                        <FormGroup row>
                          <Label for="username-deluser">User to delete</Label>
                          <Input type="text" name="username" id="username-deluser" />
                        </FormGroup>
                        <Button color="danger" id="deluser">Delete user</Button>
                      </div>
                      <div className="adduser-panel panel">
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
                            <option value="author">Author</option>
                            <option value="partner">Partner</option>
                            <option value="admin">Administrator</option>
                            <option value="god">God</option>
                          </Input>
                        </FormGroup>
                        <Button id="adduser" color="primary">Add user</Button>
                      </div>
                      <div className="pages-panel panel">
                        <h1>Edit/New page</h1>
                        <FormGroup row>
                          <Label for="select-page">Choose page</Label>
                          <Input type="select" name="select-page" className="pageselector" id="select-page">
                          </Input>
                        </FormGroup>
                        <FormGroup row>
                          <Label for="title-page">Title</Label>
                          <Input name="title-page" id="title-page"></Input>
                          <p>Permalink: <span id="permalink"></span></p>
                        </FormGroup>
                        <Button id="page-toggle-editor">Toggle HTML/Visual Editor</Button>
                        <FormGroup>
                          <br />
                          <Input type="textarea" id="page-editor-html" />
                          <ReactQuill id="page-editor-visual" />
                        </FormGroup>
                        <Button color="primary" id="submit-page">Update page</Button>
                      </div>
                      <div className="deletepage-panel panel">
                        <h1>Delete page</h1>
                        <FormGroup row>
                          <Label for="select-delpage">Choose Page</Label>
                          <Input type="select" name="select-delpage" className="pageselector" id="select-delpage">
                          </Input>
                        </FormGroup>
                        <Button color="danger" id="delpage">Delete page</Button>
                      </div>
                      <div className="css-panel panel">
                        <h1>Custom CSS</h1>
                        <Input type="textarea" name="text" id="css-textbox" />
                        <br />
                        <Button id="css" color="primary">Send</Button>
                      </div>
                      <div className="upload-panel panel">
                        <h1>Upload image</h1>
                        <FormGroup row>
                          <Label for="upload-field">Choose image</Label>
                          <Input type="file" accept=".png,.gif,.jpg,.jpeg,.ico,.svg" name="upload-field" id="upload-field" />
                        </FormGroup>
                        <p className="metadata-warning"><b>Warning:</b> While the image will be uploaded no metadata is being stripped out. Metadata may leak the location where the image has been shot at. <button className="link-button">I'm fine with this.</button></p>
                        <Button id="upload-submit" color="primary">Upload</Button>
                      </div>
                      <div className="images-panel panel">
                        <h1>Image library</h1>
                        <p>You can click on an image to delete it. To embed an image into the editor right-click, copy and paste.</p>
                        <div className="image-library">
                        </div>
                      </div>
                      <div className="advanced-panel panel">
                        <h1>Advanced Settings</h1>
                        <FormGroup row>
                          <Label for="sitename-field">Site name</Label>
                          <Input type="text" id="sitename-field" />
                        </FormGroup>
                        <FormGroup row>
                          <Label for="apiserver-field">API server</Label>
                          <Input type="text" id="apiserver-field" value={config["api"]} readOnly />
                        </FormGroup>
                        <Button id="advanced-submit" color="primary">Apply advanced settings</Button><br /><br />
                        <p>You can change the API server field in <code>src/params.json</code> and rebuild with <code>npm run build</code></p>
                      </div>
                      <div className="about-panel panel">
                        <h1>About ImperiumCMS</h1>
                        <div className="about-container"></div>
                      </div>
                    </div>
            </div>
          </div>
        </div>
        <Jumbotron>
          <Login />
        </Jumbotron>
      </div>
    );
  }
}