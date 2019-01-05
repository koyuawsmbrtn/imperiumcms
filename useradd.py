#!/usr/bin/python3
import redis
import hashlib
import json
from getpass import getpass

# Reading variables
f = open("config.json", "r")
data = json.load(f)
f.close()
salt = data["salt"]

r = redis.StrictRedis(host='localhost', port=6379, db=0)

useradmin = input("Username: ")
adminemail = input("E-mail address: ")
adminpassword = getpass("Password: ")
role = input("Role: ")

finalpassword = hashlib.md5(adminpassword.encode()).hexdigest()
finalpassword = str(hashlib.md5(finalpassword.encode() + salt.encode()).hexdigest())

r.set("imperiumcms/users/" + useradmin, useradmin)
r.set("imperiumcms/users/" + useradmin + "/email/", str(adminemail))
r.set("imperiumcms/users/" + useradmin + "/password/", finalpassword)
r.set("imperiumcms/users/" + useradmin + "/role/", str(role))

print("Done!")
