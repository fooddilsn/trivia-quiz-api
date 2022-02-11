# Trivia Quiz API

## Description

A hopefully awesome RESTful API service for creating trivia quizzes.

Each question in a quiz must have four possible answers, but only one will be the correct one.

What are you waiting for? Run the server and put all your knowledge here!

## Quickstart

```bash
$ npm install
$ cp ./env/.env.production ./.env
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
