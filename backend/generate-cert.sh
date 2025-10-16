#!/bin/sh

# Create directory for certificates
mkdir -p /app/certs

# Check if certificate already exists
if [ ! -f /app/certs/server.crt ]; then
  echo "Generating self-signed SSL certificate..."
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /app/certs/server.key \
    -out /app/certs/server.crt \
    -subj "/C=US/ST=State/L=City/O=TaskPilot/CN=*.elasticbeanstalk.com"
  
  chmod 600 /app/certs/server.key
  chmod 644 /app/certs/server.crt
  echo "Certificate generated successfully!"
else
  echo "Certificate already exists, skipping generation."
fi

# Start the application
exec "$@"
