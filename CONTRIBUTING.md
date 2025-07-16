# 🤝 Contributing to SafeExec

Thank you for your interest in contributing to SafeExec! We welcome contributions from developers of all skill levels.

## 🚀 Quick Contributor Setup

> **Follow the README.md setup first!**
>
> Make sure you've completed the [Contributor Quick Setup](../README.md#-contributor-quick-setup) section in the main README before proceeding.

### Prerequisites

- **Node.js 18+** and **Yarn** package manager
- **Docker & Docker Compose** (latest versions)
- **Git** for version control

### 1. Fork & Clone

```bash
# Fork the repository on GitHub first, then:
git clone https://github.com/YOUR_USERNAME/SafeExec.git
cd SafeExec

# Add upstream remote for syncing
git remote add upstream https://github.com/vikashkrdeveloper/SafeExec.git
```

### 2. Environment Setup (REQUIRED FIRST)

```bash
# Copy environment template - MUST DO THIS FIRST
cp .env.example .env

# Edit with your local configuration
nano .env
```

### 3. Quick Setup

```bash
# Complete development setup in one command
yarn setup:dev
```

### 4. Verify Setup

```bash
# Check API health
yarn health

# View logs
yarn logs

# Access API docs
# Visit http://localhost:5000/api-docs
```

## 📋 Development Workflow

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

# 6. Commit and push
git add .
git commit -m "feat: your descriptive commit message"
git push origin feature/your-feature-name

# 7. Create Pull Request on GitHub
```

## 🧪 Testing

```bash
# Run all tests
yarn test

# Run tests with coverage
yarn test:coverage

# Run integration tests
yarn test:integration

# Test Docker containers
yarn docker:test:run         # Run tests in test environment
yarn docker:test:coverage    # Generate coverage report
```

## 🎨 Code Style

### Formatting & Linting

```bash
yarn lint          # Check code style
yarn lint:fix      # Fix auto-fixable errors
yarn format        # Format code with Prettier
yarn typecheck     # TypeScript type checking
```

### Guidelines

- Use TypeScript for all new code
- Follow existing naming conventions
- Add JSDoc comments for public functions
- Write tests for new features
- Keep functions small and focused

## 🔐 Security Guidelines

- Never commit sensitive data (passwords, keys, tokens)
- Validate all inputs using express-validator
- Use proper authentication for protected endpoints
- Test container isolation
- Sanitize error messages

## 🐛 Bug Reports

Great bug reports include:

- A quick summary and background
- Steps to reproduce (be specific!)
- Expected vs actual behavior
- System information (OS, Node.js version, etc.)
- Error logs and stack traces

## 💡 Pull Request Guidelines

1. Fork the repository and create your branch from `master`
2. Add tests for new code
3. Update API documentation if needed
4. Ensure tests pass: `yarn test`
5. Check code style: `yarn lint`
6. Create a clear PR description

## 🆘 Questions?

- Check the [README.md](../README.md) for setup help
- Look at existing [GitHub Issues](https://github.com/vikashkrdeveloper/SafeExec/issues)
- Create a new issue for questions

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.
