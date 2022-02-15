# Trivia Quiz API

## Description

A hopefully awesome RESTful API service for creating trivia quizzes.

Each question in a quiz must have four possible answers, but only one will be the correct one.

What are you waiting for? Run the server and put all your knowledge here!

## Quickstart

```bash
$ npm install
$ cp ./env/.env.production ./.env
$ docker compose up
$ npm run start:prod
```

## Postman

Once the server is running, test the APIs using [Postman](https://www.postman.com/downloads/). All you have to do is:

- [create a workspace](https://learning.postman.com/docs/collaborating-in-postman/using-workspaces/creating-workspaces/) (e.g. Trivia Quiz API)
- [import data](https://learning.postman.com/docs/getting-started/importing-and-exporting-data/#importing-data-into-postman) from the `./postman` folder

Hope you have fun!

## Environment variables

### Environment

- `NODE_ENV`

Required: _true_ \
Description: node environment. \
Values: [`development`, `production`, `test`]

### Server

- `HOST`

Required: _false_ \
Description: domain name of the network host or its IP address.

- `PORT`

Required: _true_ \
Description: port number to connect to.

### Logger

- `LOGGER_LEVEL`

Required: _true_ \
Description: console logger level.
Values: [`silent`, `error`, `warn`, `info`, `http`, `verbose`, `debug`]

- `LOGGER_PRETTY`

Required: _false_ \
Description: boolean to enable/disable logs formatting.

- `LOGGER_REDACT`

Required: _false_ \
Description: string of keys separated by comma that hold sensitive data to hide in the log output.

### MongoDB

- `MONGODB_URI`

Required: _true_ \
Description: MongoDB connection URI.

### JWT

- `JWT_ISSUER`

Required: _true_ \
Description: principal that issued the JWT.

- `JWT_PUBLIC_KEY`

Required: _true_ \
Description: PEM encoded public key for RSA and ECDSA.

- `JWT_PRIVATE_KEY`

Required: _true_ \
Description: PEM encoded private key for RSA and ECDSA.

- `JWT_EXPIRES_IN`

Required: _true_ \
Description: expiration time of the JWT expressed in a string describing a time span [vercel/ms](https://github.com/vercel/ms).
