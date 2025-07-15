# Go Executor Dockerfile
FROM golang:1.21-bullseye

# Create non-root user
RUN groupadd -r coderunner && useradd -r -g coderunner coderunner

# Install security tools  
RUN apt-get update && apt-get install -y \
    --no-install-recommends \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy execution script
COPY run_go.sh /app/run_go.sh
RUN chmod +x /app/run_go.sh

# Set permissions
RUN chown -R coderunner:coderunner /app
RUN chmod 755 /app

# Switch to non-root user
USER coderunner

# Set Go environment
ENV GOCACHE=/tmp/go-cache
ENV GOPATH=/tmp/go
ENV GO111MODULE=off

# Set resource limits and security
ENTRYPOINT ["/app/run_go.sh"]
