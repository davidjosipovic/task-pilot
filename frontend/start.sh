#!/bin/sh
# Railway provides PORT environment variable
# Default to 3000 if not set
PORT=${PORT:-3000}
echo "Starting server on 0.0.0.0:$PORT"
exec npx serve dist --single --no-port-switching --listen tcp://0.0.0.0:$PORT
