#!/usr/bin/python3
# Ignoring everything until stable release
# pylint: disable=W0614
# pylint: disable=W1401
# pylint: disable=W0612

from bottle import *
import json
import os
import redis
import hashlib
import os
import subprocess

f = open("src/params.json", "r")
data = json.load(f)
f.close()
f = open("config.json", "r")
config = json.load(f)
f.close()
salt = config["salt"]

r = redis.StrictRedis(host='localhost', port=6379, db=0)

def removebytes(s):
        return s.replace("b'", "").replace("'", "")

# Static Routes

@get("/static/css/<filepath>")
def css(filepath):
    return static_file(filepath, root="build/static/css")

@get("/static/font/<filepath:re:.*\.(eot|otf|svg|ttf|woff|woff2?)>")
def font(filepath):
    return static_file(filepath, root="build/static/font")

@get("/img/<filepath:re:.*\.(jpg|png|gif|ico|svg)>")
def img(filepath):
    return static_file(filepath, root="img/")

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
    f = open("content/" + path + ".html")
    s = f.read().replace("{{appname}}", data["appname"])
    f.close()
    return s

@get("/api/v1/login/<username>/<password>")
def login(username, password):
        response.headers['Access-Control-Allow-Origin'] = '*'
        if r.get("imperiumcms/users/" + username + "/password/") == bytes(hashlib.md5(password.encode() + salt.encode()).hexdigest().encode()):
                sid = str(os.popen("sh genhash").read()).replace("\n", "")
                r.set("imperiumcms/sessions/" + username + "/" + sid + "/login", b"true")
                x = {"sid": sid, "success": "true"}
                response.content_type = "application/json"
                return json.dumps(x)
        else:
                response.content_type = "application/json"
                return json.dumps({"error": "wrongcreds"})

@get("/api/v1/verify/session/<username>/<sid>")
def verify(username, sid):
        response.headers['Access-Control-Allow-Origin'] = '*'
        if r.get("imperiumcms/sessions/" + username + "/" + sid + "/login") == b"true" and r.get("imperiumcms/users/" + username) == bytes(username.encode()):
                response.content_type = "application/json"
                return json.dumps({"verified": "true"})
        else:
                response.content_type = "application/json"
                return json.dumps({"error": "noverify"})

@post("/api/v1/change/page/<username>/<sid>/<page>/<title>")
def changepage(username, sid, page, title):
        response.headers['Access-Control-Allow-Origin'] = '*'
        content = request.forms.get("content")
        if r.get("imperiumcms/users/" + username + "/role/") == b"god" or r.get("imperiumcms/users/" + username + "/role/") == b"admin" or r.get("imperiumcms/users/" + username + "/role/") == b"author" and r.get("imperiumcms/sessions/" + username + "/" + sid + "/login") == b"true":
                response.content_type = "application/json"
                f = open("content/" + page + ".html", "w+")
                f.write("<h1>" + title + "</h1>\n" + content)
                f.close()
                return json.dumps({"changed": "true"})
        else:
                response.content_type = "application/json"
                return json.dumps({"error": "nochange"})

@post("/api/v1/delete/page/<username>/<sid>/<page>")
def deletepage(username, sid, page):
        response.headers['Access-Control-Allow-Origin'] = '*'
        content = request.forms.get("content")
        if r.get("imperiumcms/users/" + username + "/role/") == b"god" or r.get("imperiumcms/users/" + username + "/role/") == b"admin" or r.get("imperiumcms/users/" + username + "/role/") == b"author" and r.get("imperiumcms/sessions/" + username + "/" + sid + "/login") == b"true":
                response.content_type = "application/json"
                subprocess.Popen(["rm", "-f", "content/" + page.replace(".", "").replace("/", "").replace("\\", "") + ".html"], shell=False)
                return json.dumps({"deleted": "true"})
        else:
                response.content_type = "application/json"
                return json.dumps({"error": "nodelete"})

@get("/api/v1/verify/admin/<username>/<sid>")
def verifyadmin(username, sid):
        response.headers['Access-Control-Allow-Origin'] = '*'
        if r.get("imperiumcms/users/" + username + "/role/") == b"admin" and r.get("imperiumcms/sessions/" + username + "/" + sid + "/login") == b"true":
                response.content_type = "application/json"
                return json.dumps({"verified": "true"})
        else:
                response.content_type = "application/json"
                return json.dumps({"error": "noverify"})

@get("/api/v1/destroy/session/<username>/<sid>")
def destroysession(username, sid):
        response.headers['Access-Control-Allow-Origin'] = '*'
        try:
                r.set("imperiumcms/sessions/" + username + "/" + sid + "/login", "")
                return json.dumps({"destroyed": "true"})
        except:
                return json.dumps({"error": "nodestroy"})

@get("/api/v1/server/restart/<username>/<sid>")
def restart(username, sid):
        response.headers['Access-Control-Allow-Origin'] = '*'
        if r.get("imperiumcms/users/" + username + "/role/") == b"god" and r.get("imperiumcms/sessions/" + username + "/" + sid + "/login") == b"true":
                python = sys.executable
                os.execl(python, python, * sys.argv)
        else:
                response.content_type = "application/json"
                return json.dumps({"error": "norestart"})

@get("/api/v1/server/stop/<username>/<sid>")
def stop(username, sid):
        response.headers['Access-Control-Allow-Origin'] = '*'
        if r.get("imperiumcms/users/" + username + "/role/") == b"god" and r.get("imperiumcms/sessions/" + username + "/" + sid + "/login") == b"true":
                os.system("killall redis-server")
                os.system("kill -9 " + str(os.getpid()))
        else:
                response.content_type = "application/json"
                return json.dumps({"error": "nostop"})

@get("/api/v1/get/role/<username>/<sid>")
def getrole(username, sid):
        response.headers['Access-Control-Allow-Origin'] = '*'
        if r.get("imperiumcms/sessions/" + username + "/" + sid + "/login") == b"true":
                response.content_type = "application/json"
                role = r.get("imperiumcms/users/" + username + "/role/")
                return json.dumps({"role": removebytes(str(role))})
        else:
                response.content_type = "application/json"
                return json.dumps({"error": "norestart"})

@get("/api/v1/user/add/<username>/<sid>/<role>/<newuser>/<password>/<email>")
def adduser(username, sid, role, newuser, password, email):
        response.headers['Access-Control-Allow-Origin'] = '*'
        if r.get("imperiumcms/users/" + username + "/role/") == b"god" or r.get("imperiumcms/users/" + username + "/role/") == b"admin" and r.get("imperiumcms/sessions/" + username + "/" + sid + "/login") == b"true":
                finalpassword = str(hashlib.md5(password.encode() + salt.encode()).hexdigest())
                r.set("imperiumcms/users/" + newuser, newuser)
                r.set("imperiumcms/users/" + newuser + "/email/", str(email))
                r.set("imperiumcms/users/" + newuser + "/password/", finalpassword)
                r.set("imperiumcms/users/" + newuser + "/role/", str(role))
                response.content_type = "application/json"
                return json.dumps({"status": "success"})
        else:
                response.content_type = "application/json"
                return json.dumps({"error": "noadduser"})

@get("/api/v1/user/del/<username>/<sid>/<usertodelete>")
def deluser(username, sid, usertodelete):
        response.headers['Access-Control-Allow-Origin'] = '*'
        if r.get("imperiumcms/users/" + username + "/role/") == b"god" or r.get("imperiumcms/users/" + username + "/role/") == b"admin" and r.get("imperiumcms/sessions/" + username + "/" + sid + "/login") == b"true":
                r.set("imperiumcms/users/" + usertodelete, "")
                r.set("imperiumcms/users/" + usertodelete + "/email/", "")
                r.set("imperiumcms/users/" + usertodelete + "/password/", "")
                r.set("imperiumcms/users/" + usertodelete + "/role/", "")
                response.content_type = "application/json"
                return json.dumps({"status": "success"})
        else:
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
        content = request.forms.get("css")
        if r.get("imperiumcms/users/" + username + "/role/") == b"god" or r.get("imperiumcms/users/" + username + "/role/") == b"admin" and r.get("imperiumcms/sessions/" + username + "/" + sid + "/login") == b"true":
            f = open("custom.css", "w")
            f.write(content)
            f.close()
            return json.dumps({"status": "success"})
        else:
            return json.dumps({"error": "nochangecss"})

@get("/api/v1/get/css")
def getcss():
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.content_type = "text/css"
        f = open("custom.css")
        s = f.read()
        f.close()
        return s

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
    hello = {"appname": data["appname"]}
    response.content_type = "application/json"
    return json.dumps(hello)

@get("/")
def index():
    return static_file("index.html", root="build/")

@get("/<filename>")
def findex(filename):
    try:
        if not filename == "admin":
            ending = filename.split(".")[1:][0]
            if not ending == "":
                if ".js" in filename:
                    response.content_type = "text/javascript"
                return static_file(filename, root="build/")
            else:
                return static_file("index.html", root="build/")
        else:
            return static_file("index.html", root="build/")
    except:
        return static_file("index.html", root="build/")
        

run(server="tornado", host="0.0.0.0", port=8080)