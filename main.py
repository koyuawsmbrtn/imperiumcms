#!/usr/bin/python3
# pylint: disable=missing-docstring,redefined-outer-name

import hashlib
import json
import os
import os.path
import subprocess

import redis
from bottle import get, post, request, response, route, run, static_file

with open("src/params.json", "r") as file:
    data = json.load(file)  # pylint: disable=invalid-name
with open("config.json", "r") as file:
    config = json.load(file)  # pylint: disable=invalid-name
salt = config["salt"]  # pylint: disable=invalid-name

# pylint: disable=invalid-name
r = redis.StrictRedis(host='localhost', port=6379, db=0)


def removebytes(s):
    return s.replace("b'", "").replace("'", "")


# Static Routes

@get("/static/css/<filepath>")
def css(filepath):
    return static_file(filepath, root="build/static/css")


@get(r"/static/font/<filepath:re:.*\.(eot|otf|svg|ttf|woff|woff2?)>")
def font(filepath):
    response.headers['Access-Control-Allow-Origin'] = '*'
    ext = os.path.splitext(filepath)[1]
    path_prefix, file_mode, response.content_type = {
        # "extension": ("path_prefix", "file_mode", "mime_type"),
        ".svg": ("public/static/font/", "r", "image/svg+xml"),
        ".woff": ("public/static/font/", "br", "application/font-woff"),
        ".woff2": ("public/static/font/", "br", "application/font-woff2"),
        ".ttf": ("public/static/font/", "br", "application/x-font-ttf"),
        ".eot": ("public/static/font/", "br", "application/vnd.ms-fontobject"),
        ".otf": ("public/static/font/", "br", "application/x-font-opentype"),
    }[ext]
    with open(path_prefix + filepath, file_mode) as file:
        return file.read()


@get(r"/img/<filepath:re:.*\.(jpg|png|gif|ico|svg)>")
def img(filepath):
    response.headers['Access-Control-Allow-Origin'] = '*'
    ext = os.path.splitext(filepath)[1]
    if ext == ".svg":
        file = open("img/" + filepath, "r")
        response.content_type = "image/svg+xml"
    else:
        file = open("img/" + filepath, "br")
        response.content_type = "image/" + ext
    with file:
        return file.read()


@get("/static/js/<filepath>")
def js(filepath):
    return static_file(filepath, root="build/static/js")


@get("/api/v1/content/")
def emptycontent():
    response.headers['Access-Control-Allow-Origin'] = '*'
    return ""


@get("/api/v1/content/<path>")
def content(path):
    response.headers['Access-Control-Allow-Origin'] = '*'
    if not path == "dashboard":
        with open("content/" + path + ".html") as file:
            return file.read().replace("{{appname}}", data["appname"])
    return ""


@get("/api/v1/get/dashboard/<username>/<sid>")
def dashboard(username, sid):
    response.headers['Access-Control-Allow-Origin'] = '*'
    if (r.get("imperiumcms/sessions/" + username + "/" + sid + "/login")
            == b"true" and r.get("imperiumcms/users/" + username)
            == bytes(username.encode())):
        with open("content/dashboard.html") as file:
            return file.read().replace("{{appname}}", data["appname"])
    return ""


@get("/api/v1/login/<username>/<password>")
def login(username, password):
    response.headers['Access-Control-Allow-Origin'] = '*'
    if (r.get("imperiumcms/users/" + username + "/password/")
            == bytes(hashlib.md5(password.encode() + salt.encode())
                     .hexdigest().encode())):
        sid = str(os.popen("sh genhash").read()).replace("\n", "")
        r.set(
            "imperiumcms/sessions/" + username + "/" + sid + "/login", b"true"
        )
        response.content_type = "application/json"
        return json.dumps({"sid": sid, "success": "true"})
    response.content_type = "application/json"
    return json.dumps({"error": "wrongcreds"})


@get("/api/v1/verify/session/<username>/<sid>")
def verify(username, sid):
    response.headers['Access-Control-Allow-Origin'] = '*'
    if (r.get("imperiumcms/sessions/" + username + "/" + sid + "/login")
            == b"true" and r.get("imperiumcms/users/" + username)
            == bytes(username.encode())):
        response.content_type = "application/json"
        return json.dumps({"verified": "true"})
    response.content_type = "application/json"
    return json.dumps({"error": "noverify"})


@post("/api/v1/change/page/<username>/<sid>/<page>/<title>")
def changepage(username, sid, page, title):
    response.headers['Access-Control-Allow-Origin'] = '*'
    content = request.forms.get("content")  # pylint: disable=no-member
    if (r.get("imperiumcms/users/" + username + "/role/")
            in (b"god", b"admin", b"author")
            and r.get(
                "imperiumcms/sessions/" + username + "/" + sid + "/login"
            ) == b"true"):
        with open("content/" + page + ".html", "w+") as file:
            file.write("<h1>" + title + "</h1>\n" + content)
        response.content_type = "application/json"
        return json.dumps({"changed": "true"})
    response.content_type = "application/json"
    return json.dumps({"error": "nochange"})


@post("/api/v1/delete/page/<username>/<sid>/<page>")
def deletepage(username, sid, page):
    response.headers['Access-Control-Allow-Origin'] = '*'
    if (r.get("imperiumcms/users/" + username + "/role/")
            in (b"god", b"admin", b"author")
            and r.get(
                "imperiumcms/sessions/" + username + "/" + sid + "/login"
            ) == b"true"):
        subprocess.Popen([
            "rm",
            "-f",
            "content/"
            + page.translate(str.maketrans('', '', r'.\/'))
            + ".html"
        ], shell=False)
        response.content_type = "application/json"
        return json.dumps({"deleted": "true"})
    response.content_type = "application/json"
    return json.dumps({"error": "nodelete"})


@get("/api/v1/verify/admin/<username>/<sid>")
def verifyadmin(username, sid):
    response.headers['Access-Control-Allow-Origin'] = '*'
    if (r.get("imperiumcms/users/" + username + "/role/") == b"admin"
            and r.get(
                "imperiumcms/sessions/" + username + "/" + sid + "/login"
            ) == b"true"):
        response.content_type = "application/json"
        return json.dumps({"verified": "true"})
    response.content_type = "application/json"
    return json.dumps({"error": "noverify"})


@get("/api/v1/destroy/session/<username>/<sid>")
def destroysession(username, sid):
    response.headers['Access-Control-Allow-Origin'] = '*'
    try:
        r.set("imperiumcms/sessions/" + username + "/" + sid + "/login", "")
        return json.dumps({"destroyed": "true"})
    # pylint: disable=broad-except
    except Exception:
        return json.dumps({"error": "nodestroy"})


@get("/api/v1/get/role/<username>/<sid>")
def getrole(username, sid):
    response.headers['Access-Control-Allow-Origin'] = '*'
    if (r.get("imperiumcms/sessions/" + username + "/" + sid + "/login")
            == b"true"):
        role = r.get("imperiumcms/users/" + username + "/role/")
        response.content_type = "application/json"
        return json.dumps({"role": removebytes(str(role))})
    response.content_type = "application/json"
    return json.dumps({"error": "norole"})


@get("/api/v1/get/email/<username>/<sid>")
def getemail(username, sid):
    response.headers['Access-Control-Allow-Origin'] = '*'
    if (r.get("imperiumcms/sessions/" + username + "/" + sid + "/login")
            == b"true"):
        email = r.get("imperiumcms/users/" + username + "/email/")
        response.content_type = "application/json"
        return json.dumps({"email": removebytes(str(email))})
    response.content_type = "application/json"
    return json.dumps({"error": "noemail"})


# pylint: disable=too-many-arguments
@get("/api/v1/user/add/<username>/<sid>/<role>/<newuser>/<password>/<email>")
def adduser(username, sid, role, newuser, password, email):
    response.headers['Access-Control-Allow-Origin'] = '*'
    if (r.get("imperiumcms/users/" + username + "/role/") in (b"god", b"admin")
            and r.get(
                "imperiumcms/sessions/" + username + "/" + sid + "/login"
            ) == b"true"):
        finalpassword = str(
            hashlib.md5(password.encode() + salt.encode()).hexdigest()
        )
        r.set("imperiumcms/users/" + newuser, newuser)
        r.set("imperiumcms/users/" + newuser + "/email/", str(email))
        r.set("imperiumcms/users/" + newuser + "/password/", finalpassword)
        r.set("imperiumcms/users/" + newuser + "/role/", str(role))
        response.content_type = "application/json"
        return json.dumps({"status": "success"})
    response.content_type = "application/json"
    return json.dumps({"error": "noadduser"})


@get("/api/v1/user/del/<username>/<sid>/<usertodelete>")
def deluser(username, sid, usertodelete):
    response.headers['Access-Control-Allow-Origin'] = '*'
    if (r.get("imperiumcms/users/" + username + "/role/") in (b"god", b"admin")
            and r.get(
                "imperiumcms/sessions/" + username + "/" + sid + "/login"
            ) == b"true"):
        r.set("imperiumcms/users/" + usertodelete, "")
        r.set("imperiumcms/users/" + usertodelete + "/email/", "")
        r.set("imperiumcms/users/" + usertodelete + "/password/", "")
        r.set("imperiumcms/users/" + usertodelete + "/role/", "")
        response.content_type = "application/json"
        return json.dumps({"status": "success"})
    response.content_type = "application/json"
    return json.dumps({"error": "nodeluser"})


@get("/api/v1/get/pages")
def getpages():
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "application/json"
    plist = os.popen("ls content/").read().replace(".html", "").split("\n")
    return json.dumps(plist)


@post("/api/v1/change/css/<username>/<sid>")
def changecss(username, sid):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "application/json"
    content = request.forms.get("css")  # pylint: disable=no-member
    if (r.get("imperiumcms/users/" + username + "/role/") in (b"god", b"admin")
            and r.get(
                "imperiumcms/sessions/" + username + "/" + sid + "/login"
            ) == b"true"):
        with open("custom.css", "w") as file:
            file.write(content)
        return json.dumps({"status": "success"})
    return json.dumps({"error": "nochangecss"})


@get("/api/v1/get/css")
def getcss():
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "text/css"
    with open("custom.css") as file:
        return file.read()


@get("/api/v1/get/css/admin")
def getadmincss():
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "text/css"
    with open("src/Admin.css") as file:
        return file.read()


@post("/api/v1/upload/<username>/<sid>")
def upimg(username, sid):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "application/json"
    data = request.files.get("data")  # pylint: disable=no-member
    ext = os.path.splitext(data.filename)[1]
    if (r.get("imperiumcms/users/" + username + "/role/")
            in (b"god", b"admin", b"author")
            and r.get(
                "imperiumcms/sessions/" + username + "/" + sid + "/login"
            ) == b"true"):
        if ext in ('.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico'):
            try:
                data.save("img/")
            except Exception:  # pylint: disable=broad-except
                pass
            return json.dumps({
                "status": "success",
                "file": "/img/" + data.filename
            })
        return json.dumps({"error": "notallowed"})
    return json.dumps({"error": "noupload"})


@get("/api/v1/delete/<username>/<sid>/<file>")
def delimg(username, sid, file):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "application/json"
    if (r.get("imperiumcms/users/" + username + "/role/")
            in (b"god", b"admin", b"author")
            and r.get(
                "imperiumcms/sessions/" + username + "/" + sid + "/login"
            ) == b"true"):
        try:
            os.remove("img/" + file)
            return json.dumps({"status": "success"})
        except Exception:  # pylint: disable=broad-except
            pass
    return json.dumps({"error": "nodelimg"})


@get("/api/v1/get/images")
def getimages():
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "text/plain"
    return os.popen("ls img/").read()


# Service Worker
@get("/service-worker.js")
def serviceworker():
    return static_file("service-worker.js", root="build/")


# Favicon
@get("/favicon.ico")
def favicon():
    return static_file("favicon.ico", root="build/")


# Manifest
@get("/manifest.json")
def manifest():
    return static_file("manifest.json", root="build/")


# API
@route("/api/v1/config")
@route("/api/v1/config/")
def hello():
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.content_type = "application/json"
    return json.dumps({"appname": data["appname"]})


@get("/")
def index():
    return static_file("index.html", root="build/")


@get("/blank-user")
def blankuser():
    return static_file("blank.png", root=".")


@get("/logo")
def logo():
    return static_file("logo.svg", root=".")


@get("/<filename>")
def findex(filename):
    try:
        if not filename == "admin":
            ext = os.path.splitext(filename)[1]
            if not ext == "":
                if ext.endswith(".js"):
                    response.content_type = "text/javascript"
                return static_file(filename, root="build/")
    except Exception:  # pylint: disable=broad-except
        pass
    return static_file("index.html", root="build/")


run(server="tornado", host="0.0.0.0", port=8080)
