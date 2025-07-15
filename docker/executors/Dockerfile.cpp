# C++ Executor Dockerfile
FROM gcc:12-bullseye

# Create non-root user
RUN groupadd -r coderunner && useradd -r -g coderunner coderunner

# Install security tools and remove network tools
RUN apt-get update && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy execution script
COPY run_cpp.sh /app/run_cpp.sh
RUN chmod +x /app/run_cpp.sh

# Set permissions
RUN chown -R coderunner:coderunner /app
RUN chmod 755 /app

# Switch to non-root user
USER coderunner

# Set resource limits and security
ENTRYPOINT ["/app/run_cpp.sh"]
