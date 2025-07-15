# 🚀 SafeExec - Secure Code Execution Platform

[![CI/CD Pipeline](https://github.com/vikashkrdeveloper/SafeExec/actions/workflows/ci.yml/badge.svg)](https://github.com/vikashkrdeveloper/SafeExec/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/docker-required-blue.svg)](https://www.docker.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-green.svg)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7.0+-red.svg)](https://redis.io/)

> **SafeExec** is an enterprise-grade, open-source Remote Code Execution (RCE) platform that enables secure, isolated execution of code in multiple programming languages. Built with security-first architecture, it provides Docker-containerized execution environments, JWT authentication, comprehensive rate limiting, and real-time monitoring.

## 🌟 Why SafeExec?

- **🔒 Security First**: Every code execution runs in isolated Docker containers
- **🚀 Production Ready**: Built with enterprise-grade security and monitoring
- **🌍 Open Source**: Community-driven development and contributions welcome
- **🔧 Easy Setup**: One-command Docker deployment for all environments
- **📚 Well Documented**: Comprehensive API docs and contributor guides

## 🏗️ System Architecture

SafeExec follows a microservices architecture with layered security and isolated execution environments:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                🌐 CLIENT LAYER                                  │
├─────────────────┬─────────────────┬─────────────────┬─────────────────────────┤
│   💻 Web Apps   │  📱 Mobile Apps │  🔗 API Clients │   🛠️ Third-party Tools  │
└─────────────────┴─────────────────┴─────────────────┴─────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           🛡️ SECURITY & LOAD BALANCER                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│  🔄 Nginx Reverse Proxy                                                        │
│  • SSL/TLS Termination        • Rate Limiting        • Request Routing         │
│  • DDoS Protection            • Load Balancing       • Static File Serving     │
└─────────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              🚀 APPLICATION LAYER                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                          📡 SafeExec API Server                                │
│  • 🔐 JWT Authentication      • ✅ Request Validation    • 📊 Business Logic   │
│  • 🚦 Rate Limiting          • 📋 Queue Management      • 🔍 Health Checks    │
│                                                                                 │
│                          ⚡ Background Workers                                  │
│  ┌─────────────────┬─────────────────┬─────────────────┬─────────────────────┐  │
│  │ 🔧 Code Executor│ 📝 Queue        │ 🧹 Cleanup      │ 📊 Metrics         │  │
│  │    Worker       │  Processor      │   Worker        │   Collector         │  │
│  └─────────────────┴─────────────────┴─────────────────┴─────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           🐳 EXECUTION ENVIRONMENT                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                              Docker Host Engine                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    🔒 Secure Isolated Containers                       │   │
│  ├─────────────┬─────────────┬─────────────┬─────────────┬─────────────────┤   │
│  │ 🐍 Python   │ 📗 Node.js  │ ☕ Java     │ 🐹 Go       │ 🦀 Rust (Soon) │   │
│  │   3.11      │    18.x     │    17       │   1.21      │     Latest      │   │
│  │             │             │             │             │                 │   │
│  │ • Sandbox   │ • V8 Engine │ • OpenJDK   │ • Compiler  │ • Memory Safe   │   │
│  │ • Non-root  │ • Isolated  │ • Security  │ • Fast Exec │ • Performance   │   │
│  │ • Timeout   │ • Limited   │ • Manager   │ • Static    │ • Secure        │   │
│  └─────────────┴─────────────┴─────────────┴─────────────┴─────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               💾 DATA LAYER                                     │
├─────────────────────────────────────┬───────────────────────────────────────────┤
│          🍃 MongoDB Cluster         │           🔴 Redis Cluster              │
│                                     │                                           │
│  • 👤 User Profiles & Auth          │  • 🔐 Session Management                │
│  • 📝 Problems & Test Cases         │  • 🚦 Rate Limiting Data               │
│  • 💻 Code Submissions              │  • 📋 Job Queue (Bull/Agenda)          │
│  • 📊 Execution Results             │  • ⚡ Caching Layer                    │
│  • 📈 Analytics & Metrics           │  • 🔄 Real-time Data                   │
│  • 🗃️ Audit Logs                   │  • 📡 Pub/Sub Messaging                │
│                                     │                                           │
│  Features:                          │  Features:                                │
│  • Replica Sets for HA             │  • Master-Slave Replication             │
│  • Automatic Failover              │  • Persistence & Backup                 │
│  • Horizontal Scaling              │  • Memory Optimization                  │
└─────────────────────────────────────┴───────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          📊 MONITORING & OBSERVABILITY                          │
├─────────────────┬─────────────────┬─────────────────┬───────────────────────────┤
│  📋 Logging     │  📈 Metrics     │  🔔 Alerting    │    🎯 Health Checks      │
│                 │                 │                 │                           │
│ • Winston       │ • Prometheus    │ • Email Alerts  │ • API Health             │
│ • Structured    │ • Custom        │ • Slack Notify  │ • Database Connectivity  │
│ • Log Levels    │ • Metrics       │ • PagerDuty     │ • Redis Connectivity     │
│ • File & Cloud  │ • Grafana       │ • Webhooks      │ • Container Status       │
│ • ELK Stack     │ • Dashboard     │ • Escalation    │ • Resource Usage         │
└─────────────────┴─────────────────┴─────────────────┴───────────────────────────┘
```

### 🔄 Data Flow Architecture

```
📝 Code Submission Flow:
───────────────────────

1. 👤 User submits code via API
   │
   ▼
2. 🔐 JWT Authentication & Rate Limiting
   │
   ▼
3. ✅ Input Validation & Sanitization
   │
   ▼
4. 📋 Job queued in Redis with metadata
   │
   ▼
5. ⚡ Background worker picks up job
   │
   ▼
6. 🐳 Docker container created & isolated
   │
   ▼
7. 💻 Code executed with resource limits
   │
   ▼
8. 📊 Results captured & processed
   │
   ▼
9. 🗃️ Results stored in MongoDB
   │
   ▼
10. 📡 Real-time response to user
    │
    ▼
11. 🧹 Container cleanup & resource release
```

### 🛡️ Security Architecture

```
🔒 Multi-Layer Security Model:
─────────────────────────────

┌─────────────────────────────────────────────────────────────────┐
│                        🌐 PERIMETER SECURITY                    │
├─────────────────────────────────────────────────────────────────┤
│ • WAF (Web Application Firewall)                               │
│ • DDoS Protection & Rate Limiting                              │
│ • SSL/TLS Encryption (HTTPS Only)                              │
│ • Geographic Blocking                                          │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                       🔐 APPLICATION SECURITY                   │
├─────────────────────────────────────────────────────────────────┤
│ • JWT Authentication with Refresh Tokens                       │
│ • Role-Based Access Control (RBAC)                            │
│ • Input Validation & Sanitization                             │
│ • SQL Injection Prevention                                     │
│ • XSS Protection                                              │
│ • CSRF Protection                                             │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                       🐳 CONTAINER SECURITY                     │
├─────────────────────────────────────────────────────────────────┤
│ • Non-root User Execution                                      │
│ • Read-only File Systems                                       │
│ • Network Isolation (No Internet Access)                      │
│ • Resource Limits (CPU, Memory, Time)                         │
│ • Temporary Containers (Auto-destroy)                         │
│ • Minimal Base Images                                          │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                        🗃️ DATA SECURITY                        │
├─────────────────────────────────────────────────────────────────┤
│ • Encryption at Rest & in Transit                             │
│ • Database Authentication & Authorization                      │
│ • Sensitive Data Masking in Logs                             │
│ • Regular Security Backups                                    │
│ • Audit Trails & Compliance Logging                          │
└─────────────────────────────────────────────────────────────────┘
```

### 🔧 Component Details

#### **Frontend Layer**

- **Web Applications**: React/Vue.js frontends
- **Mobile Apps**: React Native/Flutter applications
- **API Clients**: Third-party integrations and tools

#### **Security & Routing Layer**

- **Nginx Proxy**: SSL termination, load balancing, rate limiting
- **WAF Protection**: Web Application Firewall rules
- **DDoS Protection**: Request throttling and IP blocking

#### **Application Services**

- **Authentication Service**: JWT-based user authentication
- **Authorization Service**: Role-based access control (RBAC)
- **Code Execution Service**: Secure code execution orchestration
- **Problem Management**: Coding challenges and test cases
- **Submission Tracking**: Complete audit trail

#### **Execution Infrastructure**

- **Docker Engine**: Container orchestration and management
- **Language Executors**: Isolated containers for each language
- **Resource Management**: CPU, memory, and time limits
- **Security Controls**: Non-root execution, network isolation

#### **Data Management**

- **MongoDB Cluster**: Primary data store with replication
- **Redis Cluster**: Caching, sessions, and job queues
- **Backup Systems**: Automated backups and disaster recovery

#### **Monitoring & Operations**

- **Application Logs**: Structured logging with Winston
- **System Metrics**: Performance and resource monitoring
- **Health Checks**: Service availability monitoring
- **Alerting**: Real-time notifications for issues

## ✨ Features

### 🔐 Security & Authentication

- **JWT-based Authentication**: Secure user registration and login
- **User-specific Execution**: Each user's code runs in isolated containers
- **Rate Limiting**: Configurable submission limits per user/IP
- **Input Validation**: Comprehensive sanitization and validation
- **Container Isolation**: Each submission runs in a separate Docker container
- **Resource Limits**: CPU, memory, and execution time constraints

### 💻 Code Execution

- **Multi-language Support**: Python, JavaScript/Node.js, Java
- **Secure Execution**: Non-root containers with restricted permissions
- **Real-time Results**: Instant feedback on code execution
- **Error Handling**: Comprehensive error reporting and logging
- **Timeout Protection**: Automatic termination of long-running processes

### 📊 Database & API

- **User Management**: Registration, profiles, and submission history
- **Problem Management**: Coding challenges with test cases
- **Submission Tracking**: Complete audit trail of all executions
- **RESTful API**: Clean, documented API endpoints
- **Health Monitoring**: Built-in health checks and metrics

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and **Yarn** package manager
- **Docker & Docker Compose** (latest versions)
- **Git** for version control
- **MongoDB** (handled by Docker Compose)
- **Redis** (handled by Docker Compose)

### 🔄 For Contributors - Local Development Setup

#### 1. Fork & Clone the Repository

```bash
# Fork the repository on GitHub first, then:
git clone https://github.com/YOUR_USERNAME/SafeExec.git
cd SafeExec

# Add upstream remote for syncing
git remote add upstream https://github.com/vikashkrdeveloper/SafeExec.git
```

#### 2. Quick Setup (Recommended for Contributors)

```bash
# Complete development setup in one command
yarn setup:dev

# This command will:
# - Install all dependencies
# - Build Docker executor containers
# - Start development environment with Docker
# - Seed database with sample data
```

#### 3. Manual Setup (Step by Step)

**3.1. Install Dependencies & Build Executors**

```bash
yarn setup
# Equivalent to: yarn install && yarn build:executors
```

**3.2. Environment Configuration**

```bash
# Copy environment template
cp .env.example .env

# Edit the .env file with your local configuration
nano .env  # or use your preferred editor
```

**Sample .env for local development:**

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/rce_dev
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-super-secret-jwt-key-for-development
JWT_EXPIRES_IN=24h
```

**3.3. Start Development Environment**

```bash
# Option 1: Full Docker environment (Recommended)
yarn docker:setup:dev
# This builds and starts all services: API, MongoDB, Redis, Nginx

# Option 2: Start services individually
yarn docker:dev:build    # Build containers
yarn docker:dev          # Start all services
yarn docker:seed:dev     # Seed database with sample data

# Option 3: Local development (API only, requires local MongoDB/Redis)
yarn dev
```

**3.4. Verify Setup**

```bash
# Check all services are running
yarn docker:status

# Check API health
yarn health
# Or manually: curl -f http://localhost:5000/health

# View logs
yarn logs
# Or: yarn docker:dev:logs

# Access container shell (for debugging)
yarn shell
# Or: yarn docker:dev:shell
```

### 🏭 Production Deployment

#### 1. Server Setup

```bash
# Clone to production server
git clone https://github.com/vikashkrdeveloper/SafeExec.git
cd SafeExec

# Setup production environment
yarn setup:prod
# This installs dependencies, builds executors, and starts production services
```

#### 2. Manual Production Setup

**2.1. Dependencies and Build**

```bash
yarn setup
# Installs dependencies and builds Docker executors
```

**2.2. Environment Configuration**

```bash
# Copy and configure production environment
cp .env.example .env
# Edit with production values
```

**2.3. Deploy Services**

```bash
# Build and start production environment
yarn docker:setup:prod

# Or step by step:
yarn docker:prod:build  # Build production containers
yarn docker:prod        # Start production services
```

#### 3. Production Environment Variables

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://username:password@mongodb:27017/rce_production
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=super-secure-production-secret-256-bits
ALLOWED_ORIGINS=https://yourdomain.com,https://api.yourdomain.com
```

#### 4. Production Monitoring

```bash
# Check service status
yarn docker:status

# View production logs
yarn docker:prod:logs

# Check health
curl -f https://yourdomain.com/health

# Access production shell (for debugging)
yarn docker:prod:shell
```

### 📋 Development Workflow for Contributors

#### Daily Development

```bash
# 1. Sync with upstream
git checkout main
git pull upstream main
git push origin main

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Start development environment
yarn setup:dev
# Or if already set up: yarn docker:dev

# 4. Make your changes...

# 5. Run tests and checks
yarn test
yarn lint
yarn typecheck

# 6. Test in different environments
yarn docker:test:run         # Run tests in test environment
yarn docker:test:coverage    # Generate coverage report

# 7. Commit and push
git add .
git commit -m "feat: your descriptive commit message"
git push origin feature/your-feature-name

# 8. Create Pull Request on GitHub
```

#### Testing Your Changes

```bash
# Run all tests
yarn test

# Run tests with coverage
yarn test:coverage

# Run integration tests
yarn test:integration

# Test Docker containers
yarn docker:test            # Start test environment
yarn docker:test:run        # Run tests in containers
yarn docker:test:coverage   # Generate coverage in containers

# Manual API testing
yarn health                 # Check API health
curl http://localhost:5000/api-docs  # Check API docs
```

#### Debugging and Troubleshooting

```bash
# View logs
yarn logs                   # Development logs
yarn docker:prod:logs       # Production logs

# Access container shell
yarn shell                  # Development container
yarn docker:prod:shell      # Production container

# Check service status
yarn docker:status          # All containers status
yarn docker:health          # Health check status

# Restart services
yarn restart                # Restart development environment
yarn reset                  # Complete reset (clean + setup)
```

## 🔧 Configuration

### Environment Variables (.env)

```bash
# Database
MONGO_USERNAME=admin
MONGO_PASSWORD=securePassword123!
MONGO_DB=rce_system

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-256-bits
JWT_EXPIRES_IN=24h

# Security
MAX_SUBMISSIONS_PER_MINUTE=10
MAX_SUBMISSIONS_PER_HOUR=100
MAX_SUBMISSIONS_PER_DAY=500

# Execution Limits
EXECUTOR_TIMEOUT_MS=30000
EXECUTOR_MEMORY_LIMIT_MB=128
EXECUTOR_CPU_LIMIT=0.5
```

## 📝 API Documentation

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Profile

```http
GET /api/auth/profile
Authorization: Bearer <jwt_token>
```

### Code Execution Endpoints

#### Submit Code

```http
POST /api/submit
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "problemId": "64f8a123b456789012345678",
  "language": "python",
  "code": "print('Hello, World!')"
}
```

#### Get Submissions

```http
GET /api/submit/list?limit=50
Authorization: Bearer <jwt_token>
```

#### Get Submission Details

```http
GET /api/submit/:submissionId
Authorization: Bearer <jwt_token>
```

### Public Endpoints

#### List Problems

```http
GET /api/problems
```

#### System Stats

```http
GET /api/submit/stats
```

## 🐳 Docker Configuration

### Supported Languages

#### Python (3.11)

- Secure execution environment
- Standard library available
- Resource-limited containers
- Non-root execution

#### JavaScript/Node.js (18)

- V8 engine with security restrictions
- Core modules available
- Memory and CPU limits
- Isolated file system

#### Java (17)

- OpenJDK runtime
- Compile and execute workflow
- Security manager enabled
- Resource constraints

### Container Security

- **Non-root execution**: All code runs as unprivileged user
- **Read-only file system**: Prevents file system modifications
- **Network isolation**: No external network access
- **Resource limits**: CPU, memory, and time restrictions
- **Temporary containers**: Automatically cleaned up after execution

## 🔒 Security Features

### Authentication & Authorization

- JWT tokens with configurable expiration
- Password hashing with bcrypt
- User-specific resource access
- Role-based access control (admin/user)

### Rate Limiting

- IP-based rate limiting
- User-based submission limits
- Configurable time windows
- Automatic blocking of abuse

### Input Validation

- Code length restrictions
- Language validation
- Problem ID verification
- SQL injection prevention

### Container Security

- Isolated execution environments
- Resource consumption limits
- Network restrictions
- File system isolation

## 📊 Monitoring & Logging

### Health Checks

- Database connectivity
- Redis connectivity
- API responsiveness
- Container availability

### Logging

- Structured logging with Winston
- Request/response logging
- Error tracking
- Performance metrics

### Metrics

- Submission statistics
- User activity tracking
- System resource usage
- Error rates and patterns

### 🌍 Development Commands Reference

```bash
# � Quick Setup Commands
yarn setup                  # Install dependencies + build executors
yarn setup:dev             # Complete dev setup (recommended for contributors)
yarn setup:test            # Complete test environment setup
yarn setup:prod            # Complete production setup

# 💻 Development Commands
yarn dev                   # Start development server (local)
yarn build                 # Build for production
yarn start                 # Start production server
yarn worker                # Start background worker
yarn seed                  # Seed database with sample problems

# 🐳 Docker Environment Management
yarn docker:dev            # Start development environment
yarn docker:dev:build      # Build development containers
yarn docker:dev:down       # Stop development environment
yarn docker:dev:logs       # View development logs
yarn docker:dev:shell      # Access development container shell

yarn docker:test           # Start test environment
yarn docker:test:build     # Build test containers
yarn docker:test:run       # Run tests in containers
yarn docker:test:coverage  # Generate coverage in containers

yarn docker:prod           # Start production environment
yarn docker:prod:build     # Build production containers
yarn docker:prod:logs      # View production logs
yarn docker:prod:shell     # Access production container shell

# 🧪 Testing Commands
yarn test                  # Run unit tests
yarn test:watch            # Run tests in watch mode
yarn test:coverage         # Generate test coverage report
yarn test:integration      # Run integration tests

# 🔍 Code Quality Commands
yarn lint                  # Check code style
yarn lint:fix              # Fix linting issues automatically
yarn format                # Format code with Prettier
yarn format:check          # Check code formatting
yarn typecheck             # TypeScript type checking

# 🛠️ Utility Commands
yarn clean                 # Clean build artifacts
yarn install:clean         # Clean install (remove node_modules + reinstall)
yarn build:executors       # Build Docker execution containers
yarn ssl:generate          # Generate SSL certificates

# 📊 Monitoring Commands
yarn docker:status         # Check all container status
yarn docker:health         # Check container health
yarn health                # Check API health endpoint
yarn logs                  # View development logs

# 🔧 Maintenance Commands
yarn restart               # Restart development environment
yarn reset                 # Complete reset (clean + setup)
yarn docker:clean          # Clean Docker resources
yarn docker:clean:all      # Clean all Docker resources (including images)
```

### 📁 Project Structure

```
SafeExec/
├── 📁 src/                    # Source code
│   ├── 📁 config/             # Configuration files
│   │   ├── db.ts              # Database connection
│   │   ├── env.ts             # Environment variables
│   │   ├── environment.ts     # Environment management
│   │   └── swagger.ts         # API documentation config
│   ├── 📁 controllers/        # API route handlers
│   │   ├── auth.controller.ts # Authentication endpoints
│   │   ├── problem.controller.ts # Problem management
│   │   └── submission.controller.ts # Code submission
│   ├── 📁 executors/          # Code execution engine
│   │   ├── dockerExecutor.ts  # Docker execution logic
│   │   └── secureDockerExecutor.ts # Secure execution wrapper
│   ├── 📁 middleware/         # Express middleware
│   │   └── auth.middleware.ts # JWT authentication
│   ├── 📁 models/             # Database schemas (Mongoose)
│   │   ├── user.model.ts      # User schema
│   │   ├── problem.model.ts   # Problem schema
│   │   ├── submission.model.ts # Submission schema
│   │   └── testcase.model.ts  # Test case schema
│   ├── 📁 routes/             # API route definitions
│   │   ├── auth.routes.ts     # Authentication routes
│   │   ├── problem.routes.ts  # Problem routes
│   │   └── submission.routes.ts # Submission routes
│   ├── 📁 services/           # Business logic
│   │   ├── auth.service.ts    # Authentication service
│   │   └── submit.service.ts  # Submission service
│   ├── 📁 queue/              # Background job processing
│   │   ├── producer.ts        # Job producer
│   │   ├── queue.ts           # Queue management
│   │   └── worker.ts          # Job worker
│   ├── 📁 utils/              # Utility functions
│   │   ├── logger.ts          # Logging utility
│   │   └── seedProblems.ts    # Database seeding
│   └── index.ts               # Application entry point
├── 📁 docker/                 # Docker configurations
│   ├── 📁 executors/          # Secure execution containers
│   │   ├── Dockerfile.python  # Python execution environment
│   │   ├── Dockerfile.nodejs  # Node.js execution environment
│   │   ├── Dockerfile.java    # Java execution environment
│   │   ├── run_python.py      # Python execution script
│   │   ├── run_nodejs.js      # Node.js execution script
│   │   └── run_java.sh        # Java execution script
│   └── 📁 nginx/              # Nginx reverse proxy
│       ├── nginx.conf         # Main nginx configuration
│       └── 📁 conf.d/         # Additional configurations
├── 📁 tests/                  # Test files
│   ├── api.test.ts           # API endpoint tests
│   ├── executor.test.ts      # Code execution tests
│   ├── integration.test.ts   # Integration tests
│   └── setup.ts              # Test setup
├── 📁 docs/                   # Documentation
│   ├── API.md                # API documentation
│   ├── DEPLOYMENT.md         # Deployment guide
│   ├── DEVELOPMENT.md        # Development guide
│   └── DOCKER.md             # Docker documentation
├── 📁 scripts/                # Utility scripts
│   ├── build-executors.sh    # Build Docker executors
│   └── generate-ssl.sh       # Generate SSL certificates
├── 📁 .github/                # GitHub configurations
│   ├── 📁 workflows/          # GitHub Actions
│   ├── 📁 ISSUE_TEMPLATE/     # Issue templates
│   └── pull_request_template.md # PR template
├── docker-compose.yml         # Docker Compose configuration
├── Dockerfile                 # Main application Dockerfile
├── package.json              # Node.js dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── jest.config.js            # Jest testing configuration
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── LICENSE                   # MIT License
├── README.md                 # This file
└── CONTRIBUTING.md           # Contribution guidelines
```

### 🧪 Testing

```bash
# Run all tests
yarn test

# Run tests with coverage
yarn test:coverage

# Run integration tests
yarn test:integration

# Run tests in watch mode (development)
yarn test:watch

# Test in different environments
yarn docker:test:run        # Run tests in test containers
yarn docker:test:coverage   # Generate coverage in test environment
yarn docker:test:integration # Integration tests in containers

# Manual API testing
yarn health                 # Check API health
curl http://localhost:5000/api-docs  # Access API documentation
```

## 📦 Deployment

### Production Deployment

1. Configure environment variables in `.env`
2. Run `yarn setup:prod` for complete production setup
3. Verify deployment with `yarn health`
4. Set up SSL certificates with `yarn ssl:generate`
5. Configure monitoring and alerting

### Docker Compose Services

- **rce-api**: Main application server
- **mongodb**: Database with authentication
- **redis**: Caching and session management
- **nginx**: Reverse proxy with rate limiting

### Scaling Considerations

- Horizontal scaling with load balancers
- Database replication for high availability
- Redis clustering for session management
- Container orchestration with Kubernetes

## 🛡️ Security Best Practices

### Production Checklist

- [ ] Change all default passwords
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Enable monitoring and alerting
- [ ] Set up automated backups
- [ ] Regular security updates
- [ ] Penetration testing
- [ ] Log monitoring and analysis

### Container Security

- [ ] Regular base image updates
- [ ] Vulnerability scanning
- [ ] Resource limit enforcement
- [ ] Network isolation verification
- [ ] File system permission audits

## 📋 Troubleshooting

### Common Issues

#### API not responding

```bash
docker compose logs rce-api
curl http://localhost:5000/health
```

#### Database connection issues

```bash
docker compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

#### Container execution failures

```bash
docker images | grep rce-executor
docker compose logs rce-api | grep -i error
```

### Performance Tuning

- Adjust container resource limits
- Optimize database queries
- Configure connection pooling
- Monitor and scale horizontally

## 🤝 Contributing to SafeExec

We welcome contributions from developers of all skill levels! Whether you're fixing bugs, adding features, improving documentation, or enhancing security, your contributions help make this project better for everyone.

### 🌟 Ways to Contribute

- **🐛 Bug Reports**: Found a bug? Create an issue with detailed reproduction steps
- **✨ Feature Requests**: Have an idea? Share it through GitHub issues
- **📝 Documentation**: Help improve our docs, API documentation, or code comments
- **🔧 Code Contributions**: Fix bugs, add features, or optimize performance
- **🛡️ Security**: Help identify and fix security vulnerabilities
- **🧪 Testing**: Add tests, improve test coverage, or test on different platforms
- **🎨 UI/UX**: Improve API responses, error messages, or developer experience

### 🚀 Getting Started as a Contributor

#### 1. Find an Issue or Create One

```bash
# Check existing issues
# Visit: https://github.com/vikashkrdeveloper/SafeExec/issues

# Look for labels:
# - good-first-issue    # Perfect for beginners
# - help-wanted         # Community help needed
# - bug                 # Bug fixes needed
# - enhancement         # New features
# - documentation       # Docs improvements
```

#### 2. Set Up Your Development Environment

Follow the [Local Development Setup](#-for-contributors---local-development-setup) section above.

#### 3. Understand the Codebase

```bash
# Explore the project structure
tree src/

# Key directories:
src/
├── controllers/     # API endpoint handlers
├── services/        # Business logic
├── models/          # Database schemas
├── middleware/      # Authentication, validation
├── executors/       # Code execution engine
├── routes/          # API route definitions
└── utils/           # Helper functions

# Read existing code and tests
ls tests/
```

#### 4. Code Style and Standards

```bash
# We use ESLint and Prettier for code formatting
yarn lint           # Check code style
yarn lint:fix       # Auto-fix style issues
yarn format         # Format code with Prettier
yarn typecheck      # TypeScript type checking
```

**Code Guidelines:**

- Use TypeScript for all new code
- Follow existing naming conventions
- Add JSDoc comments for public functions
- Write tests for new features
- Keep functions small and focused
- Use meaningful variable names

#### 5. Testing Guidelines

```bash
# Run tests before submitting
yarn test                    # Unit tests
yarn test:coverage          # Test coverage report
yarn test:integration       # Integration tests

# Test Docker functionality
ENV=test yarn docker:test:run

# Manual testing
curl http://localhost:5000/health
```

**Testing Requirements:**

- Add tests for new features
- Maintain >80% code coverage
- Test both success and error cases
- Include integration tests for API endpoints
- Test Docker container functionality

#### 6. Security Considerations

**Always consider security when contributing:**

- Never expose sensitive data in logs
- Validate all user inputs
- Use parameterized queries for database operations
- Follow the principle of least privilege
- Test container isolation
- Review Docker configurations

#### 7. Submitting Your Contribution

```bash
# 1. Create a descriptive branch name
git checkout -b fix/mongodb-connection-error
# or
git checkout -b feature/add-rust-language-support

# 2. Make your changes with clear commits
git add .
git commit -m "fix: resolve MongoDB connection timeout issue

- Update connection string validation
- Add retry logic for database connections
- Improve error handling and logging
- Add unit tests for connection scenarios

Fixes #123"

# 3. Push and create Pull Request
git push origin fix/mongodb-connection-error
```

**Pull Request Guidelines:**

- Use descriptive titles and descriptions
- Reference related issues (e.g., "Fixes #123")
- Include screenshots for UI changes
- List breaking changes if any
- Update documentation if needed

### 🏗️ Development Commands Reference

```bash
# Setup and Installation
yarn install                 # Install dependencies
yarn build:executors        # Build Docker execution containers

# Development
yarn dev                     # Start development server
yarn dev --watch            # Start with file watching
yarn seed                    # Seed database with sample data

# Environment Management
ENV=development yarn docker:dev        # Start dev environment
ENV=test yarn docker:test              # Start test environment
ENV=production yarn docker:prod        # Start prod environment

# Testing
yarn test                    # Run unit tests
yarn test:watch             # Run tests in watch mode
yarn test:coverage          # Generate coverage report
yarn test:integration       # Run integration tests

# Code Quality
yarn lint                    # Check code style
yarn lint:fix               # Fix linting issues
yarn format                 # Format code with Prettier
yarn typecheck              # TypeScript type checking

# Docker Management
yarn docker:status          # Check container status
yarn docker:clean           # Clean up Docker resources
yarn docker:dev:logs        # View development logs
yarn docker:dev:shell       # Access container shell
```

### 🌍 Community Guidelines

#### Code of Conduct

- **Be Respectful**: Treat all contributors with respect and kindness
- **Be Inclusive**: Welcome developers from all backgrounds and skill levels
- **Be Constructive**: Provide helpful feedback and suggestions
- **Be Patient**: Help newcomers learn and grow
- **Be Professional**: Keep discussions focused and productive

#### Communication Channels

- **GitHub Issues**: Bug reports, feature requests, questions
- **Pull Requests**: Code contributions and reviews
- **Discussions**: General questions and community chat
- **Security Issues**: Email maintainers for security vulnerabilities

#### Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes for significant contributions
- GitHub repository insights
- Special thanks in major releases

### 🎯 Contribution Ideas for Beginners

#### Easy Issues (good-first-issue)

- Fix typos in documentation
- Add more test cases
- Improve error messages
- Add input validation
- Update dependencies

#### Medium Issues

- Add new language support
- Improve Docker security
- Add API rate limiting features
- Enhance logging
- Add metrics and monitoring

#### Advanced Issues

- Implement horizontal scaling
- Add Kubernetes support
- Improve performance
- Security auditing
- Add advanced features

### 📚 Learning Resources

#### Understanding the Project

- Read the [API Documentation](docs/API.md)
- Check [Deployment Guide](docs/DEPLOYMENT.md)
- Study [Development Guide](docs/DEVELOPMENT.md)

#### Technical Skills

- **Docker**: [Official Docker Documentation](https://docs.docker.com/)
- **Node.js/TypeScript**: [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- **MongoDB**: [MongoDB Manual](https://docs.mongodb.com/manual/)
- **API Design**: [REST API Guidelines](https://restfulapi.net/)

### 🔄 Staying Updated

```bash
# Keep your fork updated
git remote add upstream https://github.com/vikashkrdeveloper/SafeExec.git
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

### 🆘 Getting Help

**Stuck? Need help? Here's how to get support:**

1. **Check Documentation**: Read README, API docs, and contribution guides
2. **Search Issues**: Look for similar problems in GitHub issues
3. **Ask Questions**: Create a GitHub issue with the "question" label
4. **Join Discussions**: Participate in GitHub Discussions
5. **Review Code**: Look at existing implementations for examples

**When asking for help, please include:**

- Operating system and version
- Node.js and Docker versions
- Clear description of the problem
- Steps to reproduce the issue
- Relevant logs or error messages
- What you've already tried

### 💡 Tips for Success

- **Start Small**: Begin with documentation or small bug fixes
- **Read Code**: Understand existing patterns before adding new code
- **Test Thoroughly**: Always test your changes manually and with automated tests
- **Ask Questions**: Don't hesitate to ask for clarification or help
- **Be Patient**: Code review may take time, especially for large changes
- **Learn Continuously**: Use contributions as learning opportunities

---

**Thank you for contributing to SafeExec! 🚀**

Your contributions help create a better, more secure code execution platform for developers worldwide.

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:

- Create GitHub issues for bugs
- Check documentation for common solutions
- Review logs for detailed error information
- Test with provided test scripts

---

**⚠️ Security Notice**: This is a powerful system that executes arbitrary code. Always run in isolated environments and follow security best practices for production deployments.
