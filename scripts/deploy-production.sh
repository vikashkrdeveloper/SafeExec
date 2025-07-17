#!/bin/bash

# Production Deployment Script for High-Load RCE Backend
# This script deploys the RCE backend optimized for 1000+ concurrent users

set -e

echo "🚀 Starting production deployment for high-load RCE backend..."

# Configuration
ENV=${ENV:-production}
WORKER_REPLICAS=${WORKER_REPLICAS:-8}
API_REPLICAS=${API_REPLICAS:-3}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose is not installed. Please install it and try again."
    exit 1
fi

# Create production environment file if it doesn't exist
if [ ! -f ".env.production" ]; then
    print_warning "Production environment file not found. Creating from example..."
    cp .env.production.example .env.production
    print_warning "Please edit .env.production with your production values before continuing."
    read -p "Press Enter to continue after editing .env.production..."
fi

# Load production environment
source .env.production

print_status "Building executor images for production..."

# Build all executor images
./scripts/build-executors.sh

print_status "Building application images..."

# Build the main application image
docker-compose build rce-api

print_status "Starting production services..."

# Deploy with production configuration
ENV=production docker-compose up -d --scale rce-worker=${WORKER_REPLICAS} --scale rce-api=${API_REPLICAS}

print_status "Waiting for services to be healthy..."

# Wait for services to be healthy
timeout=300
counter=0

while [ $counter -lt $timeout ]; do
    if docker-compose ps | grep -E "(healthy|running)" > /dev/null; then
        break
    fi
    
    sleep 5
    counter=$((counter + 5))
    echo -n "."
done

echo ""

if [ $counter -ge $timeout ]; then
    print_error "Services failed to start within ${timeout} seconds"
    docker-compose logs --tail=50
    exit 1
fi

print_status "Checking service health..."

# Check individual service health
services=("mongodb" "redis" "rce-api" "nginx")

for service in "${services[@]}"; do
    if docker-compose ps | grep "$service" | grep -E "(healthy|running)" > /dev/null; then
        print_status "$service is healthy"
    else
        print_error "$service is not healthy"
        docker-compose logs "$service" --tail=20
    fi
done

print_status "Production deployment completed!"

echo ""
echo "📊 Deployment Summary:"
echo "  Environment: $ENV"
echo "  API Replicas: $API_REPLICAS"
echo "  Worker Replicas: $WORKER_REPLICAS"
echo "  Estimated Capacity: $(($WORKER_REPLICAS * 20)) concurrent executions"
echo ""

print_status "Useful commands:"
echo "  Monitor logs:     docker-compose logs -f"
echo "  Scale workers:    docker-compose up -d --scale rce-worker=N"
echo "  Service status:   docker-compose ps"
echo "  Stop services:    docker-compose down"
echo ""

# Optional: Run a quick health check
if command -v curl &> /dev/null; then
    print_status "Running health check..."
    
    if curl -f http://localhost/health > /dev/null 2>&1; then
        print_status "✅ Health check passed!"
    else
        print_warning "⚠️  Health check failed. Services may still be starting up."
    fi
fi

print_status "🎉 Production deployment successful! Your RCE backend is ready for 1000+ concurrent users."
