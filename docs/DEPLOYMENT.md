# Deployment Guide

## Production Deployment

### Prerequisites

- Docker and Docker Compose
- MongoDB (local or cloud)
- Redis (local or cloud)
- Domain name with SSL certificate (recommended)

### Environment Variables

Create a `.env` file:

```env
# Application
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/rce_backend
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your_super_secret_jwt_key_here_min_256_bits
BCRYPT_ROUNDS=12

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Rate Limiting
GENERAL_RATE_LIMIT=100
AUTH_RATE_LIMIT=5
EXECUTION_RATE_LIMIT=10

# Docker
DOCKER_HOST=unix:///var/run/docker.sock
```

### Docker Deployment

1. **Build executor images:**

```bash
chmod +x scripts/build-executors.sh
./scripts/build-executors.sh
```

2. **Deploy with Docker Compose:**

```bash
chmod +x deploy-production.sh
./deploy-production.sh
```

### Manual Deployment

1. **Install dependencies:**

```bash
yarn install --production
```

2. **Build the application:**

```bash
yarn build
```

3. **Start the application:**

```bash
yarn start
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Security Considerations

1. **Firewall:** Only allow necessary ports (80, 443, 22)
2. **Docker Security:** Run containers as non-root users
3. **Rate Limiting:** Implement proper rate limiting
4. **Input Validation:** Validate all user inputs
5. **Logging:** Monitor and log all activities
6. **Updates:** Keep all dependencies updated

### Monitoring

1. **Health Check:** `GET /health`
2. **Logs:** Check `logs/` directory
3. **Docker Stats:** Monitor container resource usage
4. **Database:** Monitor MongoDB and Redis performance

### Backup

1. **Database Backup:**

```bash
mongodump --uri="$MONGODB_URI" --out=backup/$(date +%Y%m%d)
```

2. **Redis Backup:**

```bash
redis-cli --rdb dump.rdb
```

### Scaling

For high-traffic scenarios:

1. **Horizontal Scaling:** Use multiple application instances
2. **Load Balancer:** Distribute traffic across instances
3. **Database Sharding:** Scale MongoDB horizontally
4. **Redis Cluster:** Use Redis cluster for caching
5. **Container Orchestration:** Consider Kubernetes for large-scale deployments
