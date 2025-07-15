# 🚀 SafeExec - Secure Code Execution Platform

[![CI/CD Pipeline](https://github.com/vikashkrdeveloper/SafeExec/actions/workflows/ci.yml/badge.svg)](https://github.com/vikashkrdeveloper/SafeExec/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/docker-required-blue.svg)](https://www.docker.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-green.svg)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7.0+-red.svg)](https://redis.io/)

> **SafeExec** is an open-source Remote Code Execution (RCE) platform for secure, isolated code execution in multiple programming languages. Built with a security-first architecture, it provides Docker-containerized execution environments, JWT authentication, rate limiting, and real-time monitoring.

## 🌍 Open Source & Community Driven

- **🌟 Open Source**: Community-driven development. Contributions are welcome!
- **🔧 Easy Setup**: One-command Docker deployment for local development.
- **📚 Well Documented**: Comprehensive API docs and contributor guides.
- **🤝 Friendly for Contributors**: Clear guidelines, good-first-issues, and a welcoming community.

## 🏗️ System Architecture

SafeExec uses a microservices architecture with layered security and isolated execution environments. See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for more details.

---

## 🚀 Quick Start for Contributors

### Prerequisites

- **Node.js 18+** and **Yarn**
- **Docker & Docker Compose** (latest)
- **Git**

### 1. Fork & Clone the Repository

```bash
# Fork on GitHub, then:
git clone https://github.com/YOUR_USERNAME/SafeExec.git
cd SafeExec
git remote add upstream https://github.com/vikashkrdeveloper/SafeExec.git
```

### 2. Local Development Setup (Recommended)

```bash
yarn setup:dev
# Installs dependencies, builds Docker executors, starts all services, seeds DB
```

### 3. Manual Setup (Step by Step)

```bash
yarn setup           # Install dependencies & build executors
cp .env.example .env # Copy env template and edit for local config
yarn docker:setup:dev # Start all services (API, MongoDB, Redis, Nginx)
yarn docker:seed:dev # Seed database with sample data
yarn dev             # (API only, needs local MongoDB/Redis)
```

### 4. Verify Setup

```bash
yarn docker:status   # Check all services
yarn health          # Check API health
yarn logs            # View logs
yarn shell           # Access container shell
```

---

## 🤝 Contributing

We welcome contributions from everyone! Whether you're fixing bugs, adding features, improving docs, or enhancing security, your help makes SafeExec better.

### Ways to Contribute

- **🐛 Bug Reports**: Create issues with clear steps
- **✨ Feature Requests**: Suggest new features
- **📝 Documentation**: Improve docs or code comments
- **🔧 Code**: Fix bugs, add features, optimize performance
- **🛡️ Security**: Help identify and fix vulnerabilities
- **🧪 Testing**: Add or improve tests

### Getting Started

1. Find or create an issue ([good-first-issue](https://github.com/vikashkrdeveloper/SafeExec/issues?q=is%3Aissue+is%3Aopen+label%3Agood-first-issue) is great for beginners)
2. Set up your environment (see above)
3. Follow code style: `yarn lint`, `yarn format`, `yarn typecheck`
4. Run tests: `yarn test`, `yarn test:coverage`, `yarn test:integration`
5. Make a branch, commit, push, and open a Pull Request

### Code Guidelines

- Use TypeScript for all new code
- Add JSDoc for public functions
- Write tests for new features
- Keep functions small and focused
- Use meaningful variable names

---

## 📁 Project Structure

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for a full breakdown.

```
SafeExec/
├── src/           # Source code
├── docker/        # Docker configs
├── tests/         # Test files
├── docs/          # Documentation
├── scripts/       # Utility scripts
├── ...
```

---

## 📝 API Documentation

See [docs/API.md](docs/API.md) for full API reference.

---

## 🆘 Getting Help

- Check documentation and issues
- Ask questions via GitHub Issues or Discussions
- When asking for help, include OS, Node.js, Docker versions, error logs, and steps to reproduce

---

## 📄 License

MIT License - see LICENSE file for details

---

**Thank you for contributing to SafeExec! 🚀**
