# High-Performance Deployment Guide

This guide covers deploying and optimizing the RCE Backend for 1000+ concurrent users.

## Performance Optimizations Applied

### 1. C++ Compilation Fixed

- ✅ Enhanced C++ executor with proper compilation flow
- ✅ Improved error handling and timeout management
- ✅ Static linking for better performance
- ✅ Memory limit increased to 512MB for C++ compilation

### 2. High Concurrency Support

- ✅ Nginx worker connections increased to 4096
- ✅ Rate limiting optimized (50 req/s with 100 burst)
- ✅ Connection keep-alive and load balancing
- ✅ Enhanced buffer settings for high throughput

### 3. Queue System Optimization

- ✅ Worker concurrency increased to 10 per worker
- ✅ Multiple worker replicas (default: 4, recommended: 8 for production)
- ✅ Priority queue for urgent executions
- ✅ Batch processing capabilities
- ✅ Enhanced Redis connection pooling

### 4. Database Optimization

- ✅ MongoDB connection pooling (maxPoolSize: 50, minPoolSize: 5)
- ✅ Redis connection optimization
- ✅ Proper indexing and query optimization

### 5. Docker Resource Management

- ✅ Optimized resource limits and security constraints
- ✅ Improved cleanup and container lifecycle management
- ✅ Better error handling and logging

## Quick Start for Production

### 1. Copy Environment Configuration

```bash
cp .env.production.example .env.production
# Edit .env.production with your production values
```

### 2. Deploy for High Load

```bash
# Deploy with optimized settings for 1000+ users
./scripts/deploy-production.sh
```

### 3. Monitor Performance

```bash
# Monitor system performance and get optimization recommendations
./scripts/monitor-performance.sh
```

## Scaling Guide

### For 1000+ Concurrent Users

1. **Worker Scaling**:

   ```bash
   # Scale to 8 workers (supports ~160 concurrent executions)
   docker-compose up -d --scale rce-worker=8
   ```

2. **API Scaling**:

   ```bash
   # Scale API instances for high availability
   docker-compose up -d --scale rce-api=3
   ```

3. **Database Optimization**:
   - Use MongoDB Atlas or dedicated MongoDB cluster
   - Configure Redis Cluster for high availability
   - Enable MongoDB sharding for large datasets

### Performance Metrics

| Configuration          | Concurrent Users | Executions/sec | Memory Usage |
| ---------------------- | ---------------- | -------------- | ------------ |
| Default (1 worker)     | 100              | 2-5            | 256MB        |
| Optimized (4 workers)  | 500              | 10-20          | 1GB          |
| Production (8 workers) | 1000+            | 20-40          | 2GB          |

## Environment Variables for High Load

```bash
# Worker Configuration
WORKER_REPLICAS=8
WORKER_CONCURRENCY=20

# Rate Limiting
MAX_SUBMISSIONS_PER_MINUTE=200
MAX_SUBMISSIONS_PER_HOUR=2000
MAX_SUBMISSIONS_PER_DAY=20000

# Resource Limits
EXECUTOR_TIMEOUT_MS=30000
EXECUTOR_MEMORY_LIMIT_MB=512
EXECUTOR_CPU_LIMIT=2.0

# Database Connection Pooling
MONGODB_URI=mongodb://user:pass@host/db?maxPoolSize=50&minPoolSize=10
```

## Monitoring Commands

```bash
# Real-time performance monitoring
./scripts/monitor-performance.sh

# Check container health
docker-compose ps

# Monitor logs
docker-compose logs -f rce-worker

# Redis queue status
docker-compose exec redis redis-cli llen "bull:submission:waiting"

# System resource usage
docker stats
```

## Troubleshooting High Load Issues

### 1. High Queue Backlog

```bash
# Check queue length
docker-compose exec redis redis-cli llen "bull:submission:waiting"

# Scale workers
docker-compose up -d --scale rce-worker=12
```

### 2. Memory Issues

```bash
# Check memory usage
free -h
docker stats

# Reduce executor memory limits
# Edit .env.production: EXECUTOR_MEMORY_LIMIT_MB=256
```

### 3. CPU Bottlenecks

```bash
# Check CPU usage
top

# Scale API instances
docker-compose up -d --scale rce-api=5
```

### 4. Network Timeouts

```bash
# Check nginx configuration
docker-compose exec nginx nginx -t

# Monitor connections
netstat -an | grep :80 | wc -l
```

## Security Considerations for Production

1. **Container Security**:
   - Non-root user execution
   - Resource limits enforced
   - No network access for executors
   - Read-only root filesystem

2. **Network Security**:
   - Rate limiting enabled
   - CORS properly configured
   - Security headers applied
   - SSL/TLS termination

3. **Data Security**:
   - MongoDB authentication
   - Redis password protection
   - JWT secret rotation
   - Logs sanitization

## Load Testing

Test your deployment with load testing tools:

```bash
# Install artillery for load testing
npm install -g artillery

# Create load test configuration
cat > load-test.yml << EOF
config:
  target: 'http://localhost'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Ramp up"
    - duration: 300
      arrivalRate: 50
      name: "Sustained load"
scenarios:
  - name: "Submit code execution"
    requests:
      - post:
          url: "/api/execute"
          headers:
            Content-Type: "application/json"
          json:
            code: "print('Hello World')"
            language: "python"
EOF

# Run load test
artillery run load-test.yml
```

## Best Practices for 1000+ Users

1. **Use a reverse proxy** (Nginx configured)
2. **Implement proper monitoring** (scripts provided)
3. **Scale horizontally** (multiple workers and API instances)
4. **Use managed databases** (MongoDB Atlas, Redis Cloud)
5. **Implement caching** (Redis for session management)
6. **Monitor resource usage** continuously
7. **Set up alerts** for high load conditions
8. **Regular performance testing** before peak usage

## Support

For high-load deployment support:

- Monitor performance regularly with provided scripts
- Scale workers based on queue backlog
- Use Redis clustering for very high loads
- Consider container orchestration (Kubernetes) for enterprise scale
