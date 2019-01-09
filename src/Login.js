import React from 'react';
import { Button, Input, FormGroup, Label } from 'reactstrap';
import $ from 'jquery';
import md5 from 'md5';
import * as config from './params.json';

export default class Login extends React.Component {
    componentDidMount() {
        //Click event on login button
        $("#login").click(function() {
            //Get username and hash password from input
            var username = $("#username").val();
            var password = md5($("#password").val());

            //Request login
            $.getJSON(config["api"] + "/api/v1/login/" + username + "/" + password, function(data) {
                if (data["success"] === "true") {
                    /*Store session ID and username in localStorage
                    Might store this information in a cookie later :)*/
                    localStorage.setItem("sessionid", data["sid"]);
                    localStorage.setItem("username", username);
                    localStorage.setItem("editor-type", "visual");
                    //Reload the page and trigger other events to verify login
                    window.location.reload();
                } else {
                    //Otherwise logout if not successful
                    $(".login").show();
                    $(".errorlogin").show();
                }
            });
        });

        //Submit form if the Enter key has been pressed
        $("input").keypress(function (e) {
            if (e.which === 13) {
              $("#login").click();
              return false;
            }
        });
    }

    render() {
        return (
            //Render login form
            <div>
                <FormGroup row>
                    <Label for="username">Username</Label>
                    <Input type="text" name="username" id="username" />
                </FormGroup>
                <FormGroup row>
                    <Label for="password">Password</Label>
                    <Input type="password" name="password" id="password" />
                </FormGroup>
                <Button color="primary" id="login">Login</Button>
            </div>
        )
    }
}