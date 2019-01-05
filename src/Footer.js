import React from 'react';
import $ from 'jquery';
import * as config from './params.json';

export default class Footer extends React.Component {
    componentDidMount() {
        //Get year and add it to Copyright notice
        var d = new Date();
        var y = d.getFullYear();
        $(".year").html(y);

        //Set titles for Footer.js (using content API)
        $.get(config["api"] + "/api/v1/content/privacy", function(data) {
            $(".link-privacy").html(data.split("\n")[0].replace("<h1>", "").replace("</h1>", ""));
        });
        $.get(config["api"] + "/api/v1/content/imprint", function(data) {
            $(".link-imprint").html(data.split("\n")[0].replace("<h1>", "").replace("</h1>", ""));
        });

        $(".appname").html(config["appname"]);
    }
    render() {
        return (
            //Render Footer
            <div>
                <footer className="footer">
                    <span className="text-muted">&copy; <span className="year"></span> <span class="appname"></span> | <a href="/privacy" className="link-privacy" rel="noopener noreferrer">Datenschutz</a> | <a href="/imprint" className="link-imprint" rel="noopener noreferrer">Impressum</a></span>
                </footer>
            </div>
        );
    }
}