#!/bin/sh
set -e

terraform init -backend-config=${BACKEND_CONFIG}

exec "$@"