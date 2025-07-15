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

## 🧑‍💻 **Contributor Quick Start**

> **We love contributors!** Follow these steps to get started quickly:

### 1. Fork & Clone the Repository

```bash
# Fork the repository on GitHub first, then:
git clone https://github.com/YOUR_USERNAME/SafeExec.git
cd SafeExec

git remote add upstream https://github.com/vikashkrdeveloper/SafeExec.git
```

### 2. Quick Local Setup (Recommended)

```bash
yarn setup:dev
# Installs dependencies, builds Docker executors, starts dev environment, seeds DB
```

### 3. Manual Setup (Step by Step)

```bash
yarn setup
cp .env.example .env
# Edit .env as needed

yarn docker:setup:dev
# Or: yarn dev (if running MongoDB/Redis locally)
```

### 4. Verify Setup

```bash
yarn docker:status
yarn health
```

### 5. Start Contributing!

- Create a feature branch: `git checkout -b feature/your-feature`
- Make your changes and add tests
- Run checks: `yarn test && yarn lint && yarn typecheck`
- Commit and push: `git commit -m "feat: your change" && git push`
- Open a Pull Request on GitHub

---

## 🤝 How to Contribute

- **Find an issue**: Look for [good first issue](https://github.com/vikashkrdeveloper/SafeExec/issues?q=is%3Aissue+is%3Aopen+label%3Agood-first-issue) or [help wanted](https://github.com/vikashkrdeveloper/SafeExec/issues?q=is%3Aissue+is%3Aopen+label%3Ahelp-wanted)
- **Discuss**: Comment on issues or open a new one for ideas
- **Follow code style**: Use ESLint, Prettier, and TypeScript
- **Write tests**: Keep coverage high
- **Update docs**: If you change or add features

See the [Contributing Guide](CONTRIBUTING) for more details.

---

## 🚀 Quick Start (for all users)

### Prerequisites

- **Node.js 18+** and **Yarn**
- **Docker & Docker Compose**
- **Git**
- **MongoDB** and **Redis** (via Docker Compose)

### Local Development Setup

```bash
yarn setup:dev
# or step by step:
yarn setup
cp .env.example .env
# Edit .env

yarn docker:setup:dev
# or: yarn dev
```

---

## 📚 Documentation

- [API Documentation](docs/API.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [Docker Guide](docs/DOCKER.md)

---

## 📝 API Endpoints (Sample)

- `POST /api/auth/register` — Register user
- `POST /api/auth/login` — Login
- `GET /api/auth/profile` — Get profile
- `POST /api/submit` — Submit code
- `GET /api/problems` — List problems

See [API.md](docs/API.md) for full details.

---

## 🛡️ Security & Architecture

- Isolated Docker containers for each code run
- JWT authentication & rate limiting
- Input validation & sanitization
- Resource limits (CPU, memory, time)
- Audit logs & monitoring

---

## 📦 Project Structure

```
SafeExec/
├── src/           # Source code
├── docker/        # Docker configs
├── tests/         # Tests
├── docs/          # Documentation
├── scripts/       # Utility scripts
├── ...            # More files
```

---

## 🆘 Getting Help

- Check [issues](https://github.com/vikashkrdeveloper/SafeExec/issues)
- Read the docs
- Open a discussion or ask a question

---

## 📄 License

MIT License - see LICENSE file for details

---

**Thank you for contributing to SafeExec! 🚀**
