#!/bin/bash

# Docker Permission Setup Script
# This script fixes Docker socket permissions for RCE Backend

set -e

echo "🔧 Setting up Docker permissions for RCE Backend..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m'

print_step() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root. This script should typically be run as a regular user."
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

print_success "Docker is running"

# Check Docker socket permissions
DOCKER_SOCK="/var/run/docker.sock"
if [ ! -S "$DOCKER_SOCK" ]; then
    print_error "Docker socket not found at $DOCKER_SOCK"
    exit 1
fi

print_step "Checking Docker socket permissions..."
ls -la "$DOCKER_SOCK"

# Get current user
CURRENT_USER=$(whoami)
print_step "Current user: $CURRENT_USER"

# Check if user is in docker group
if groups "$CURRENT_USER" | grep -q '\bdocker\b'; then
    print_success "User $CURRENT_USER is already in the docker group"
else
    print_warning "User $CURRENT_USER is not in the docker group"
    print_step "Adding user to docker group..."
    
    if sudo usermod -aG docker "$CURRENT_USER"; then
        print_success "User added to docker group successfully"
        print_warning "Please log out and log back in, or run 'newgrp docker' to apply group changes"
    else
        print_error "Failed to add user to docker group"
        exit 1
    fi
fi

# Set correct permissions on Docker socket
print_step "Setting Docker socket permissions..."
if sudo chmod 666 "$DOCKER_SOCK"; then
    print_success "Docker socket permissions set successfully"
else
    print_error "Failed to set Docker socket permissions"
    exit 1
fi

# Verify Docker access
print_step "Verifying Docker access..."
if docker ps > /dev/null 2>&1; then
    print_success "Docker access verified successfully"
else
    print_error "Docker access verification failed"
    print_warning "You may need to log out and log back in for group changes to take effect"
    exit 1
fi

# Check if we're in the correct directory
if [ ! -f "package.json" ] || [ ! -f "docker-compose.yml" ]; then
    print_warning "Please run this script from the RCE Backend root directory"
    exit 1
fi

print_success "Docker permissions setup completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "  1. If you just added yourself to the docker group, log out and log back in"
echo "  2. Run 'yarn docker:dev' to start the development environment"
echo "  3. Test code execution at http://localhost:5000/api/execute"
echo ""
echo "🔍 If you still have permission issues:"
echo "  - Try: newgrp docker"
echo "  - Restart Docker: sudo systemctl restart docker"
echo "  - Check Docker daemon: sudo systemctl status docker"
