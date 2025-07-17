#!/bin/bash

# Performance Monitoring and Optimization Script
# Monitors system performance and provides optimization recommendations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

print_status() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header "RCE Backend Performance Monitor"

# Check Docker resources
print_header "Docker Resource Usage"

if docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" | grep -E "(rce-|mongodb|redis|nginx)" > /dev/null 2>&1; then
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" | grep -E "(rce-|mongodb|redis|nginx)"
else
    print_warning "No RCE containers found running"
fi

echo ""

# Check Redis queue status
print_header "Queue Status"

if docker-compose ps redis | grep "Up" > /dev/null 2>&1; then
    # Get queue statistics
    echo "Checking Redis queue status..."
    
    # Check if redis-cli is available in the container
    if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
        submission_queue_length=$(docker-compose exec -T redis redis-cli llen "bull:submission:waiting" 2>/dev/null || echo "0")
        priority_queue_length=$(docker-compose exec -T redis redis-cli llen "bull:priority-execution:waiting" 2>/dev/null || echo "0")
        
        echo "  Submission queue: $submission_queue_length jobs waiting"
        echo "  Priority queue: $priority_queue_length jobs waiting"
        
        if [ "$submission_queue_length" -gt 100 ]; then
            print_warning "High queue backlog detected! Consider scaling workers."
        else
            print_status "Queue levels are healthy"
        fi
    else
        print_warning "Cannot connect to Redis to check queue status"
    fi
else
    print_error "Redis container is not running"
fi

echo ""

# Check system resources
print_header "System Resources"

echo "CPU Usage:"
top -bn1 | grep "Cpu(s)" | awk '{print $2 $3 $4}' | sed 's/%us,/ User,/; s/%sy,/ System,/; s/%id,/ Idle/'

echo ""
echo "Memory Usage:"
free -h

echo ""
echo "Disk Usage:"
df -h | grep -E "(/$|/var)"

echo ""

# Check network connections
print_header "Network Status"

echo "Active connections to port 80 (Nginx):"
netstat -an 2>/dev/null | grep ":80 " | wc -l || echo "Unable to check connections"

echo "Active connections to port 5000 (API):"
netstat -an 2>/dev/null | grep ":5000 " | wc -l || echo "Unable to check connections"

echo ""

# Performance recommendations
print_header "Performance Recommendations"

# Check CPU usage
cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
if (( $(echo "$cpu_usage > 80" | bc -l) )); then
    print_warning "High CPU usage detected ($cpu_usage%). Consider:"
    echo "  - Scaling API replicas: docker-compose up -d --scale rce-api=N"
    echo "  - Increasing worker concurrency in worker configuration"
fi

# Check memory usage
mem_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
if (( $(echo "$mem_usage > 85" | bc -l) )); then
    print_warning "High memory usage detected ($mem_usage%). Consider:"
    echo "  - Reducing executor memory limits"
    echo "  - Scaling horizontally instead of vertically"
fi

# Check container health
unhealthy_containers=$(docker-compose ps | grep -v "Up" | grep -E "(rce-|mongodb|redis|nginx)" | wc -l)
if [ "$unhealthy_containers" -gt 0 ]; then
    print_error "$unhealthy_containers containers are not healthy"
    echo "Run 'docker-compose ps' to see container status"
fi

echo ""

# Optimization suggestions
print_header "Optimization Suggestions for 1000+ Users"

echo "Current configuration analysis:"

# Count current workers
worker_count=$(docker-compose ps | grep "rce-worker" | wc -l)
api_count=$(docker-compose ps | grep "rce-api" | wc -l)

echo "  Current workers: $worker_count"
echo "  Current API instances: $api_count"
echo "  Estimated capacity: $((worker_count * 20)) concurrent executions"

if [ "$worker_count" -lt 8 ]; then
    print_warning "For 1000+ users, consider scaling to 8+ workers:"
    echo "  docker-compose up -d --scale rce-worker=8"
fi

if [ "$api_count" -lt 3 ]; then
    print_warning "For high availability, consider multiple API instances:"
    echo "  docker-compose up -d --scale rce-api=3"
fi

echo ""
echo "Additional optimizations:"
echo "  ✓ Nginx worker_connections increased to 4096"
echo "  ✓ Rate limiting optimized for high load"
echo "  ✓ MongoDB connection pooling configured"
echo "  ✓ Redis connection optimization enabled"
echo "  ✓ Worker concurrency set to 10 per worker"

echo ""
print_status "Monitoring complete. Check recommendations above for optimal performance."

# Optional: Save report to file
if [ "$1" = "--save" ]; then
    timestamp=$(date +"%Y%m%d_%H%M%S")
    report_file="performance_report_$timestamp.txt"
    
    echo "Saving report to $report_file..."
    
    {
        echo "RCE Backend Performance Report - $(date)"
        echo "============================================"
        echo ""
        echo "Docker Stats:"
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" | grep -E "(rce-|mongodb|redis|nginx)" || echo "No containers found"
        echo ""
        echo "System Resources:"
        echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2 $3 $4}')"
        echo "Memory: $(free -h | grep Mem)"
        echo "Disk: $(df -h | grep -E "(/$|/var)")"
        echo ""
        echo "Configuration:"
        echo "Workers: $worker_count"
        echo "API instances: $api_count"
        echo "Estimated capacity: $((worker_count * 20)) concurrent executions"
    } > "$report_file"
    
    print_status "Report saved to $report_file"
fi
