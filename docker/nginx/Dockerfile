# Nginx Reverse Proxy for RCE System
FROM nginx:alpine

# Install curl and envsubst for health checks and environment variable substitution
RUN apk add --no-cache curl gettext

# Copy custom nginx configuration
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl

# Copy configuration template
COPY docker/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.template

# Copy SSL certificates if they exist (create directory first)
RUN mkdir -p /etc/nginx/ssl
COPY docker/nginx/ssl /etc/nginx/ssl/

# Create startup script
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo '# Set default values if not provided' >> /docker-entrypoint.sh && \
    echo 'export BACKEND_HOST=${BACKEND_HOST:-rce-api}' >> /docker-entrypoint.sh && \
    echo 'export BACKEND_PORT=${BACKEND_PORT:-5000}' >> /docker-entrypoint.sh && \
    echo 'envsubst "\$BACKEND_HOST \$BACKEND_PORT" < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# Set default environment variables
ENV BACKEND_HOST=rce-api
ENV BACKEND_PORT=5000

# Expose ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

CMD ["/docker-entrypoint.sh"]
