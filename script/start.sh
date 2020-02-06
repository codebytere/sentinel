#!/bin/bash

set -e

# https://hub.docker.com/_/postgres/
# docker run -it --rm --link some-postgres:postgres postgres psql -h postgres -U postgres


echo "Database Log written to tmp/db.log" >&2
echo "export DATABASE_URL=postgres://postgres@localhost:5432/postgres"
echo "export REDIS_URL=redis://localhost:6379"

mkdir -p tmp >/dev/null

(
    docker kill postgres || true
    docker kill redis || true
    docker run -d --rm --name=postgres -p 5432:5432 -v $(pwd)/var:/var/lib/postgresql/data postgres 
    docker run -d --rm --name=redis -p 6379:6379 redis 
) > tmp/db.log
