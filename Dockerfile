# Multi-stage Dockerfile for RCE Backend
# Supports development, test, and production environments

# ================================
# Base Stage - Common setup
# ================================
FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
  curl \
  bash \
  git \
  docker-cli \
  && rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /app

# Create nodejs user 
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nodejs -u 1001 -G nodejs

# Copy package files
COPY package.json yarn.lock ./

# ================================
# Dependencies Stage
# ================================
FROM base AS dependencies

# Install all dependencies (including dev dependencies)
RUN yarn install --frozen-lockfile

# ================================
# Development Stage
# ================================
FROM dependencies AS development

# Copy source code
COPY . .

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port and debug port
EXPOSE 5000 9229

# Health check
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start development server with debug support
CMD ["yarn", "dev"]

# ================================
# Test Stage
# ================================
FROM dependencies AS test

# Copy source code
COPY . .

# Build the application for testing
RUN yarn build

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=5s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Default command for tests
CMD ["yarn", "test"]

# ================================
# Builder Stage for Production
# ================================
FROM dependencies AS builder

# Copy source code
COPY . .

# Build the application
RUN yarn build

# ================================
# Production Stage
# ================================
FROM base AS production

# Install only production dependencies
RUN yarn install --frozen-lockfile --production && yarn cache clean

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Create logs directory
RUN mkdir -p /app/logs

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (res) => { \
  if(res.statusCode === 200) process.exit(0); else process.exit(1); \
  }).on('error', () => process.exit(1))"

# Start the application
CMD ["yarn", "start"]
