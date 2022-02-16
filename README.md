# Trivia Quiz API

## Description

A RESTful API service for creating trivia quizzes.

Each question in a quiz must have four possible answers, but only one will be the correct one.

What are you waiting for? Run the application and put all your knowledge there!

## Quickstart

```bash
$ docker compose -f docker-compose.yml -f docker-compose.prod.yml -p trivia-quiz up
```

Add `-d` to start all containers in detached mode (you won't see any logs).

If you want to change the environment variables, edit `./env/.env.production` (see descriptions [below](https://github.com/fooddilsn/trivia-quiz-api#environment-variables)).

Visit [http://localhost:3000/swagger](http://localhost:3000/swagger/) for APIs documentation (host and port according to environment variables).

## John Doe

When the application starts for the first time, John Doe is already there waiting for you with the following credentials:

```sh
email: "john.doe@trivia.com"
password: "YnTR8!rQ"
```

## Postman

Once the server is running, play with the APIs using [Postman](https://www.postman.com/downloads/). All you have to do is:

- [create a workspace](https://learning.postman.com/docs/collaborating-in-postman/using-workspaces/creating-workspaces/) (e.g. Trivia Quiz API)
- [import data](https://learning.postman.com/docs/getting-started/importing-and-exporting-data/#importing-data-into-postman) from the `./postman` folder

Hope you have fun!

## Development

In order to run the code in watch mode:

```bash
$ npm install
$ cp env/.env.development .env
$ docker compose up
$ npm run start:dev
```

## Test

```bash
$ npm install
$ docker compose -p trivia-quiz up -d
$ npm run test
```

Use `npm run test:cov` for coverage.

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
Description: console logger level. \
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

- `MONGODB_MIGRATIONS_FOLDER`

Required: _true_ \
Description: MongoDB migrations folder.
Values: [`development`, `production`, `test`]

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
