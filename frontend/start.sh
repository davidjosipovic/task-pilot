#!/bin/sh
# Railway provides PORT environment variable
# Default to 3000 if not set
PORT=${PORT:-3000}
echo "Starting server on port $PORT"
npx serve dist -p $PORT --single
