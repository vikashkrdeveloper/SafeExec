# Java OpenJDK 17 Executor
FROM openjdk:17-alpine

# Security: Create non-root user
RUN adduser -D -s /bin/sh coderunner

# Install essential packages
RUN apk add --no-cache \
    gcc \
    musl-dev

# Set working directory
WORKDIR /app

# Copy execution script
COPY run_java.sh /app/
COPY JavaExecutorSimple.java /app/
RUN chmod +x /app/run_java.sh

# Compile the Java executor
RUN javac JavaExecutorSimple.java

# Security configurations
RUN chown -R coderunner:coderunner /app

# Switch to non-root user
USER coderunner

# Set resource limits
ENV EXECUTION_TIMEOUT=10
ENV MEMORY_LIMIT_MB=256

CMD ["/app/run_java.sh"]
