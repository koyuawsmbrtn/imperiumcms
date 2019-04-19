# Imperium CMS

A project by koyu.space

## Dependencies

- NodeJS alongside NPM
- Python 3 with PIP
- Redis

If you need a fast way to install NodeJS you can use the [Node Version Manager](https://github.com/creationix/nvm).

## Run it on your own machine

Run the following commands to install all dependencies:

```sh
npm install
sudo pip3 install -r requirements.txt
```

1. Run the app on your machine with the `./run.sh`. It will assign all environment variables needed to run the app. After all that it begins to serve the frontend (UI, Imperium-FE) and backend (API, ImperiumAPI).

2. There are also some environment variables you can set to "true" if you need more:

```
REDIS: Starts a redis server in case you haven't started it with systemd
REBUILD: Build the frontend on start
BROWSER: Start your default browser with ImperiumCMS
```

## Found a bug?

Message support@koyu.space!