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
- **🌍 Open Source**: Community-driven development and contributions welcome
- **🔧 Easy Setup**: One-command Docker deployment for all environments
- **📚 Well Documented**: Comprehensive API docs and contributor guides

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and **Yarn** package manager
- **Docker & Docker Compose** (latest versions)
- **Git** for version control
- **MongoDB** (handled by Docker Compose)
- **Redis** (handled by Docker Compose)

## 🟢 **Contributor Quick Setup**

> **We love contributors!**
>
> **Follow these steps to get started quickly as a contributor:**

### 1. Fork & Clone the Repository

```bash
# Fork the repository on GitHub first, then:
git clone https://github.com/YOUR_USERNAME/SafeExec.git
cd SafeExec

# Add upstream remote for syncing
git remote add upstream https://github.com/vikashkrdeveloper/SafeExec.git
```

### 2. Environment Setup (REQUIRED FIRST STEP)

```bash
# Copy environment template - MUST DO THIS FIRST
cp .env.example .env

# Edit the .env file with your local configuration
nano .env  # or use your preferred editor
```

**Sample .env for local development:**

```env
# Environment
ENV=development
NODE_ENV=development
PORT=5000

# MongoDB (use localhost for local development & MongoDB Compass)
MONGO_USERNAME=admin
MONGO_PASSWORD=devpassword
MONGO_DB=safeexec_dev
MONGODB_URI=mongodb://admin:devpassword@localhost:27017/safeexec_dev?authSource=admin

# Redis (use localhost for local development & Redis clients)
REDIS_URI=redis://localhost:6379

# Security
JWT_SECRET=your-super-secret-jwt-key-for-development
JWT_EXPIRES_IN=24h

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### 3. Quick Setup (Recommended for Contributors)

```bash
# Complete development setup in one command
yarn setup:dev

# This command will:
# - Install all dependencies
# - Build Docker executor containers
# - Start development environment with Docker
# - Seed database with sample data
```

### 4. Manual Setup (Step by Step)

#### 4.1. Install Dependencies & Build Executors

```bash
yarn setup
# Equivalent to: yarn install && yarn build:executors
```

#### 4.2. Start Development Environment

```bash
# Start all services: API, MongoDB, Redis, Nginx
yarn docker:setup:dev

# Or start services individually
yarn docker:dev:build    # Build containers
yarn docker:dev          # Start all services
yarn docker:seed:dev     # Seed database with sample data

yarn dev                 # API only (requires local MongoDB/Redis)
```

#### 4.3. Verify Setup

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

---

## 📋 Development Workflow for Contributors

### Daily Development

```bash
# 1. Sync with upstream
git checkout master
git pull upstream master
git push origin master

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

### Testing Your Changes

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

### Debugging and Troubleshooting

```bash
# View logs
yarn logs                   # Development logs
yarn docker:dev:logs        # Development logs

# Access container shell
yarn shell                  # Development container
yarn docker:dev:shell       # Development container

# Check service status
yarn docker:status          # All containers status
yarn docker:health          # Health check status

# Restart services
yarn restart                # Restart development environment
yarn reset                  # Complete reset (clean + setup)
```

---

## 🤝 Contributing to SafeExec

We welcome contributions from developers of all skill levels! Whether you're fixing bugs, adding features, improving documentation, or enhancing security, your contributions help make this project better for everyone.

### How to Contribute

- **Find an issue**: Look for [good first issue](https://github.com/vikashkrdeveloper/SafeExec/issues?q=is%3Aissue+is%3Aopen+label%3Agood-first-issue) or [help wanted](https://github.com/vikashkrdeveloper/SafeExec/issues?q=is%3Aissue+is%3Aopen+label%3Ahelp-wanted)
- **Discuss**: Comment on issues or open a new one for ideas
- **Follow code style**: Use ESLint, Prettier, and TypeScript
- **Write tests**: Keep coverage high
- **Update docs**: If you change or add features

See the [Contributing Guide](CONTRIBUTING.md) for more details.

---

## 📦 Deployment

> **Note:** This project is open source and intended for local development, testing, and educational use. For production deployment, please refer to the [DEPLOYMENT.md](docs/DEPLOYMENT.md) guide and follow security best practices. **Production-specific instructions have been removed from this README.**

---

## 🛡️ Security Best Practices

> For production security, see [DEPLOYMENT.md](docs/DEPLOYMENT.md) and [DOCKER.md](docs/DOCKER.md).

---

## Thank you for contributing to SafeExec! 🚀

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
