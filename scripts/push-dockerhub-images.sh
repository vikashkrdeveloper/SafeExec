#!/bin/bash

# Build and push SafeExec images to Docker Hub.
# Usage:
#   HUB_USER=vikashkrdeveloper VERSION=v0.0.1 bash ./scripts/push-dockerhub-images.sh
#   bash ./scripts/push-dockerhub-images.sh vikashkrdeveloper v0.0.1
# Optional rebuild mode:
#   REBUILD_IMAGES=1 REBUILD_EXECUTORS=1 HUB_USER=vikashkrdeveloper VERSION=v0.0.1 bash ./scripts/push-dockerhub-images.sh

set -euo pipefail

HUB_USER="${1:-${HUB_USER:-}}"
VERSION="${2:-${VERSION:-latest}}"

if [ -z "$HUB_USER" ]; then
  echo "[ERROR] Docker Hub username is required."
  echo "Use: HUB_USER=vikashkrdeveloper VERSION=v0.0.1 bash ./scripts/push-dockerhub-images.sh"
  exit 1
fi

print_step() {
  echo "[PUSH] $1"
}

print_success() {
  echo "[SUCCESS] $1"
}

image_exists() {
  docker image inspect "$1" >/dev/null 2>&1
}

if ! docker info >/dev/null 2>&1; then
  echo "[ERROR] Docker daemon is not running."
  exit 1
fi

REBUILD_IMAGES="${REBUILD_IMAGES:-0}"
REBUILD_EXECUTORS="${REBUILD_EXECUTORS:-0}"

API_SOURCE_IMAGE="${API_SOURCE_IMAGE:-rcebackend-rce-api:latest}"
WORKER_SOURCE_IMAGE="${WORKER_SOURCE_IMAGE:-rcebackend-rce-worker:latest}"
NGINX_SOURCE_IMAGE="${NGINX_SOURCE_IMAGE:-rcebackend-nginx:latest}"

if [ "$REBUILD_IMAGES" = "1" ]; then
  print_step "REBUILD_IMAGES=1 -> building API image (production target)..."
  docker build --target production -t "$API_SOURCE_IMAGE" .

  print_step "REBUILD_IMAGES=1 -> building worker image (production target)..."
  docker build --target production -t "$WORKER_SOURCE_IMAGE" .

  print_step "REBUILD_IMAGES=1 -> building Nginx image..."
  docker build -f docker/nginx/Dockerfile -t "$NGINX_SOURCE_IMAGE" .
else
  print_step "Using existing local images (no rebuild):"
  print_step "- API source: $API_SOURCE_IMAGE"
  print_step "- Worker source: $WORKER_SOURCE_IMAGE"
  print_step "- Nginx source: $NGINX_SOURCE_IMAGE"
fi

if [ "$REBUILD_EXECUTORS" = "1" ]; then
  print_step "REBUILD_EXECUTORS=1 -> building executor images (python/nodejs/java/cpp/go)..."
  bash ./scripts/build-executors.sh
fi

if ! image_exists "$API_SOURCE_IMAGE"; then
  echo "[ERROR] API source image not found: $API_SOURCE_IMAGE"
  echo "Build it first or run with REBUILD_IMAGES=1"
  exit 1
fi

if ! image_exists "$WORKER_SOURCE_IMAGE"; then
  echo "[ERROR] Worker source image not found: $WORKER_SOURCE_IMAGE"
  echo "Build it first or run with REBUILD_IMAGES=1"
  exit 1
fi

if ! image_exists "$NGINX_SOURCE_IMAGE"; then
  echo "[ERROR] Nginx source image not found: $NGINX_SOURCE_IMAGE"
  echo "Build it first or run with REBUILD_IMAGES=1"
  exit 1
fi

print_step "Tagging API/worker/nginx images for Docker Hub..."
docker tag "$API_SOURCE_IMAGE" "$HUB_USER/safeexec-api:$VERSION"
docker tag "$API_SOURCE_IMAGE" "$HUB_USER/safeexec-api:latest"

docker tag "$WORKER_SOURCE_IMAGE" "$HUB_USER/safeexec-worker:$VERSION"
docker tag "$WORKER_SOURCE_IMAGE" "$HUB_USER/safeexec-worker:latest"

docker tag "$NGINX_SOURCE_IMAGE" "$HUB_USER/safeexec-nginx:$VERSION"
docker tag "$NGINX_SOURCE_IMAGE" "$HUB_USER/safeexec-nginx:latest"

print_step "Tagging executor images for Docker Hub..."
for lang in python nodejs java cpp go; do
  if ! image_exists "rce-executor-$lang:latest"; then
    echo "[ERROR] Executor source image not found: rce-executor-$lang:latest"
    echo "Build executors first using 'yarn build:executors' or run with REBUILD_EXECUTORS=1"
    exit 1
  fi
  docker tag "rce-executor-$lang:latest" "$HUB_USER/rce-executor-$lang:$VERSION"
  docker tag "rce-executor-$lang:latest" "$HUB_USER/rce-executor-$lang:latest"
done

print_step "Pushing API/worker/nginx images..."
docker push "$HUB_USER/safeexec-api:$VERSION"
docker push "$HUB_USER/safeexec-api:latest"
docker push "$HUB_USER/safeexec-worker:$VERSION"
docker push "$HUB_USER/safeexec-worker:latest"
docker push "$HUB_USER/safeexec-nginx:$VERSION"
docker push "$HUB_USER/safeexec-nginx:latest"

print_step "Pushing executor images..."
for lang in python nodejs java cpp go; do
  docker push "$HUB_USER/rce-executor-$lang:$VERSION"
  docker push "$HUB_USER/rce-executor-$lang:latest"
done

print_success "All images pushed successfully to Docker Hub user '$HUB_USER'."
print_step "Pushed version tag: $VERSION"
