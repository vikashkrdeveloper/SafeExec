#!/bin/bash

# Generate self-signed SSL certificates for development/testing
# For production, replace with real certificates from Let's Encrypt or your CA

SSL_DIR="./docker/nginx/ssl"
DOMAIN="rce.localhost"

# Create SSL directory if it doesn't exist
mkdir -p "$SSL_DIR"

echo "Generating self-signed SSL certificate for $DOMAIN..."

# Generate private key
openssl genrsa -out "$SSL_DIR/privkey.pem" 2048

# Generate certificate signing request
openssl req -new -key "$SSL_DIR/privkey.pem" -out "$SSL_DIR/cert.csr" -subj "/C=US/ST=CA/L=San Francisco/O=RCE Backend/CN=$DOMAIN"

# Generate self-signed certificate
openssl x509 -req -in "$SSL_DIR/cert.csr" -signkey "$SSL_DIR/privkey.pem" -out "$SSL_DIR/fullchain.pem" -days 365

# Clean up CSR
rm "$SSL_DIR/cert.csr"

echo "SSL certificates generated:"
echo "  Private key: $SSL_DIR/privkey.pem"
echo "  Certificate: $SSL_DIR/fullchain.pem"
echo ""
echo "Note: These are self-signed certificates for development/testing only."
echo "For production, replace with certificates from a trusted CA."

# Set appropriate permissions
chmod 600 "$SSL_DIR/privkey.pem"
chmod 644 "$SSL_DIR/fullchain.pem"

echo "SSL certificate generation completed!"
