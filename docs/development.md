# Sentinel Development

This document provides an oveview of Sentinel architecture and requirements for setting up and working with the codebase on your local machine.

## Prerequisites

* [Docker](https://www.docker.com/get-started)
* Node.js LTS

## Setting Up

You'll first need to clone down a copy of the repository and install dependencies.

```sh
$ git clone https://github.com/codebytere/sentinel
$ cd sentinel
$ npm install
```

Sentinel uses Postgres with Redis via Docker, so next, you'll need to start the Postgres server.

```sh
$ ./script/start.sh
# Database Log written to tmp/db.log
# export DATABASE_URL=postgres://postgres@localhost:5432/postgres
# export REDIS_URL=redis://localhost:6379
```

You should see a new `/tmp` dir created in the top level of the repository directory, and are now ready to run the app.

```sh
npm run dev
```

This will create an optimized production build with Next.js and start the app on `http://localhost:3000/`.

Should you like to change any of the defaults, the following environment variables may be set:

```js
process.env.HOST // default '0.0.0.0'
process.env.REPORT_WEBHOOK // default 'http://localhost:3000'
process.env.DATABASE_URL // default 'postgres://postgres@localhost:5432/postgres'
process.env.SESSION_SECRET // default 'myverylongsupersecretthatisloadedfromenv'
process.env.NODE_ENV // default 'development'
```
