# Docker Environment Guide

This guide explains how to use the unified Docker setup for development, testing, and production environments.

## 🏗️ Architecture

The project uses a single `docker-compose.yml` file with profiles to support multiple environments:

- **Development** (`dev`): Hot reload, debug ports, relaxed security
- **Test** (`test`): Minimal setup for automated testing
- **Production** (`prod`): Full security, SSL, rate limiting, worker processes

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Yarn package manager
- OpenSSL (for SSL certificate generation)

### 1. Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Generate SSL certificates (for HTTPS)
yarn ssl:generate

# Build executor images
yarn build:executors
```

### 2. Start Environment

Choose your environment:

```bash
# Development Environment
yarn docker:dev
# Access: http://localhost/api/, Swagger: http://localhost:5000/api-docs

# Test Environment
yarn docker:test
# Access: http://localhost:8080/api/

# Production Environment
yarn docker:prod
# Access: https://localhost/api/ (with SSL)
```

## 📋 Available Commands

### Environment Management

```bash
# Start environments
yarn docker:dev              # Start development environment
yarn docker:test             # Start test environment
yarn docker:prod             # Start production environment

# Stop environments
yarn docker:dev:down         # Stop development
yarn docker:test:down        # Stop test
yarn docker:prod:down        # Stop production

# View logs
yarn docker:dev:logs         # Development logs
yarn docker:test:logs        # Test logs (not available via yarn)
yarn docker:prod:logs        # Production logs

# Access container shell
yarn docker:dev:shell        # Development container shell
yarn docker:prod:shell       # Production container shell

# Build images
yarn docker:dev:build        # Build development images
yarn docker:test:build       # Build test images
yarn docker:prod:build       # Build production images
yarn docker:build:all        # Build all environment images
```

### Testing

```bash
# Run tests in Docker
yarn docker:test:run         # Run all tests
yarn docker:test:coverage    # Run tests with coverage
yarn docker:test:integration # Run integration tests
```

### Database Operations

```bash
# Seed database
yarn docker:seed:dev         # Seed development database
yarn docker:seed:test        # Seed test database
yarn docker:seed:prod        # Seed production database
```

### Maintenance

```bash
# View container status
yarn docker:status           # Show container status
yarn docker:health           # Show health status

# Cleanup
yarn docker:clean            # Clean unused Docker resources
yarn docker:clean:all        # Clean all Docker resources (images, containers, volumes)

# Restart
yarn docker:restart          # Restart development environment
```

### Advanced Management

```bash
# Use the unified management script
yarn docker:manage start dev     # Start development
yarn docker:manage stop prod     # Stop production
yarn docker:manage logs test     # View test logs
yarn docker:manage shell dev     # Open development shell
yarn docker:manage status        # Show all status
yarn docker:manage cleanup       # Clean up everything
```

## 🌍 Environment Details

### Development Environment

- **Profile**: `dev`
- **Ports**:
  - API: 5000 (direct), 80 (via Nginx)
  - Debug: 9229
  - MongoDB: 27017
  - Redis: 6379
- **Features**:
  - Hot reload with volume mounting
  - Swagger UI enabled
  - Debug logging
  - CORS enabled for localhost
  - No rate limiting

### Test Environment

- **Profile**: `test`
- **Ports**:
  - API: 5001 (direct), 8080 (via Nginx)
  - MongoDB: 27018
  - Redis: 6380
- **Features**:
  - Isolated test database
  - Error-level logging only
  - Swagger UI disabled
  - Minimal CORS
  - Basic rate limiting

### Production Environment

- **Profile**: `prod`
- **Ports**:
  - HTTP: 80 (redirects to HTTPS)
  - HTTPS: 443
  - MongoDB: 27017
  - Redis: 6379
- **Features**:
  - SSL/TLS encryption
  - Separate worker process
  - Strict security headers
  - Rate limiting
  - No debug endpoints
  - Swagger UI disabled

## 🔧 Configuration

### Environment Variables

Key environment variables (see `.env.example` for full list):

```bash
# Environment
ENV=development              # development, test, production

# Application
API_PORT=5000               # API server port
DEBUG_PORT=9229             # Debug port (development only)

# Database
MONGO_PORT=27017            # MongoDB port
REDIS_PORT=6379             # Redis port
MONGO_PASSWORD=password     # MongoDB password
REDIS_PASSWORD=password     # Redis password (production only)

# Nginx
NGINX_HTTP_PORT=80          # Nginx HTTP port
NGINX_HTTPS_PORT=443        # Nginx HTTPS port

# Security
JWT_SECRET=secret           # JWT signing secret
ALLOWED_ORIGINS=origins     # Comma-separated CORS origins

# Features
SWAGGER_UI_ENABLED=true     # Enable/disable API docs
LOG_LEVEL=info              # Logging level
```

### Nginx Configuration

Environment-specific Nginx configurations:

- `docker/nginx/conf.d/development.conf` - Development settings
- `docker/nginx/conf.d/test.conf` - Test settings
- `docker/nginx/conf.d/production.conf` - Production settings

The appropriate config is automatically loaded based on the `ENV` variable.

### SSL Certificates

SSL certificates are stored in `docker/nginx/ssl/`:

- `fullchain.pem` - Certificate chain
- `privkey.pem` - Private key

Generate new certificates:

```bash
yarn ssl:generate
```

**Important**: For production, replace self-signed certificates with real certificates from a trusted CA (Let's Encrypt, etc.).

## 🔍 Troubleshooting

### Common Issues

1. **Docker Permission Errors (`EACCES /var/run/docker.sock`)**:

   ```bash
   # Quick fix using our script
   yarn fix:docker

   # Manual fix - Add user to docker group
   sudo usermod -aG docker $USER

   # Set socket permissions
   sudo chmod 666 /var/run/docker.sock

   # Apply group changes (or logout/login)
   newgrp docker

   # Restart Docker service if needed
   sudo systemctl restart docker
   ```

2. **Port conflicts**:

   ```bash
   # Check what's using the port
   lsof -i :80

   # Change ports in .env file
   NGINX_HTTP_PORT=8080
   NGINX_HTTPS_PORT=8443
   ```

3. **SSL certificate errors**:

   ```bash
   # Regenerate certificates
   rm -rf docker/nginx/ssl/*
   yarn ssl:generate
   ```

4. **Database connection issues**:

   ```bash
   # Check database status
   yarn docker:status

   # View database logs
   docker logs rce-mongodb-dev
   ```

5. **Permission errors**:

   ```bash
   # Fix file permissions
   chmod +x scripts/*.sh

   # Fix SSL permissions
   chmod 600 docker/nginx/ssl/privkey.pem
   chmod 644 docker/nginx/ssl/fullchain.pem
   ```

### Viewing Logs

```bash
# All services
yarn docker:dev:logs

# Specific service
docker logs rce-api-dev
docker logs rce-mongodb-dev
docker logs rce-redis-dev
docker logs rce-nginx-dev

# Follow logs in real-time
docker logs -f rce-api-dev
```

### Debugging

```bash
# Access container shell
yarn docker:dev:shell

# Check container processes
docker exec rce-api-dev ps aux

# Check network connectivity
docker exec rce-api-dev curl http://mongodb:27017
docker exec rce-api-dev curl http://redis:6379
```

## 📁 File Structure

```
docker/
├── nginx/
│   ├── nginx.conf              # Base Nginx configuration
│   ├── conf.d/
│   │   ├── development.conf    # Development server config
│   │   ├── test.conf          # Test server config
│   │   └── production.conf    # Production server config
│   └── ssl/
│       ├── fullchain.pem      # SSL certificate
│       └── privkey.pem        # SSL private key
scripts/
├── build-executors.sh         # Build executor Docker images
├── docker-setup.sh           # Unified environment manager
└── generate-ssl.sh           # SSL certificate generator
```

## 🔒 Security Notes

### Development

- Uses HTTP only
- CORS allows all origins
- Debug endpoints enabled
- No rate limiting

### Production

- HTTPS only (HTTP redirects to HTTPS)
- Strict CORS policy
- Security headers enabled
- Rate limiting enforced
- Debug endpoints disabled
- Separate worker process

**Always update passwords and secrets for production deployment!**

## 🚢 Deployment

For production deployment:

1. Update environment variables in `.env`:

   ```bash
   ENV=production
   MONGO_PASSWORD=secure_password
   REDIS_PASSWORD=secure_password
   JWT_SECRET=secure_jwt_secret
   ALLOWED_ORIGINS=https://yourdomain.com
   ```

2. Update Nginx configuration with your domain:

   ```bash
   # Edit docker/nginx/conf.d/production.conf
   server_name yourdomain.com www.yourdomain.com;
   ```

3. Install real SSL certificates:

   ```bash
   # Replace self-signed certificates with real ones
   cp /path/to/real/fullchain.pem docker/nginx/ssl/
   cp /path/to/real/privkey.pem docker/nginx/ssl/
   ```

4. Start production environment:
   ```bash
   yarn docker:prod
   ```
