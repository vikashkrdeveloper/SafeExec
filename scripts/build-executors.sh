#!/bin/bash

# Build All Secure Code Executors Script

set -e

echo "🔨 Building All Secure Code Executors..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m'

print_step() {
    echo -e "${BLUE}[BUILD]${NC} $1"
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

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

print_success "Docker is running"

# Change to executors directory
cd docker/executors

# Build all language executors
LANGUAGES=("python" "nodejs" "java" "cpp" "go")

for lang in "${LANGUAGES[@]}"; do
    print_step "Building $lang executor..."
    
    if docker build -t "rce-executor-$lang:latest" -f "Dockerfile.$lang" .; then
        print_success "$lang executor built successfully"
    else
        print_error "Failed to build $lang executor"
        exit 1
    fi
done

# Return to root directory
cd ../..

print_success "All executors built successfully!"

echo ""
echo "📋 Built Executors:"
echo "  🐍 Python (rce-executor-python:latest)"
echo "  📗 Node.js (rce-executor-nodejs:latest)"
echo "  ☕ Java (rce-executor-java:latest)"
echo "  ⚡ C++ (rce-executor-cpp:latest)"
echo "  🔷 Go (rce-executor-go:latest)"
echo ""
echo "✅ All secure code executors are ready for use!"
