#!/bin/sh
# Substitute environment variables in the nginx config template, then start nginx.
#
# BACKEND_HOST defaults to albumweb-backend.railway.internal (Railway private network).
# Set BACKEND_HOST on the Railway service to override (e.g. to a custom private domain).

set -e

: "${BACKEND_HOST:=albumweb-backend.railway.internal}"

echo "[entrypoint] Using backend host: ${BACKEND_HOST}"

# envsubst replaces ${BACKEND_HOST} in the template and writes the final config.
envsubst '${BACKEND_HOST}' \
  < /etc/nginx/conf.d/default.conf.template \
  > /etc/nginx/conf.d/default.conf

exec nginx -g "daemon off;"
