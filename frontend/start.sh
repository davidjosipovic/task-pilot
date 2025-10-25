#!/bin/sh
# Railway provides PORT environment variable
# Default to 3000 if not set
PORT=${PORT:-3000}

# Check if dist directory exists
if [ ! -d "dist" ]; then
  echo "ERROR: dist directory not found!"
  echo "Current directory: $(pwd)"
  echo "Directory contents:"
  ls -la
  exit 1
fi

echo "Starting server on 0.0.0.0:$PORT"
echo "Serving directory: $(pwd)/dist"

# Use node_modules/.bin/serve directly
exec ./node_modules/.bin/serve dist --single --no-port-switching --listen tcp://0.0.0.0:$PORT
