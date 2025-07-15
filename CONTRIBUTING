# Contributing to SafeExec

We love your input! We want to make contributing to SafeExec as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## Getting Started

### Prerequisites

- Node.js 18+ and Yarn
- Docker and Docker Compose
- Git

### Setup

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/SafeExec.git
   cd SafeExec
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Set up environment**

   ```bash
   # Quick setup for development
   ./scripts/setup.sh --env development --seed

   # Or manually:
   cp config/environments/development.env .env
   # Edit .env if needed
   ```

4. **Start development environment**

   ```bash
   # Using the unified approach
   ENV=development yarn docker:dev

   # Or step by step
   yarn build:executors
   yarn docker:dev:build
   yarn docker:dev
   yarn seed
   ```

5. **Access API Documentation**
   - Visit http://localhost:5000/api-docs for interactive API docs

## Environment Management

This project uses a unified Docker setup controlled by the `ENV` variable:

### Development

```bash
ENV=development yarn docker:dev      # Start dev environment
ENV=development yarn docker:dev:logs # View logs
ENV=development yarn docker:dev:down # Stop services
```

### Testing

```bash
ENV=test yarn docker:test           # Start test environment
ENV=test yarn docker:test:run       # Run tests in container
ENV=test yarn docker:test:coverage  # Generate coverage
```

### Production

```bash
ENV=production yarn docker:prod     # Start prod environment
ENV=production yarn docker:prod:logs # View logs
```

## Pull Requests

1. Fork the repository and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the Swagger documentation.
4. Ensure the test suite passes.
5. Make sure your code lints and formats correctly.
6. Issue that pull request!

## Code Style

### Use Yarn for Package Management

This project uses Yarn as the package manager. Always use Yarn commands:

```bash
yarn install           # Not npm install
yarn add package       # Not npm install package
yarn remove package    # Not npm uninstall package
```

### TypeScript Guidelines

- Use TypeScript for all new code
- Prefer interfaces over types for object shapes
- Use proper typing - avoid `any`
- Export interfaces from dedicated files in `src/interfaces/`

### Code Formatting

We use Prettier and ESLint:

```bash
yarn lint          # Check for linting errors
yarn lint:fix      # Fix auto-fixable errors
yarn format        # Format code with Prettier
yarn typecheck     # TypeScript type checking
```

## Testing

### Running Tests

```bash
yarn test              # Run all tests
yarn test:watch        # Run tests in watch mode
yarn test:coverage     # Generate coverage report
yarn test:integration  # Run integration tests only

# Or in Docker
ENV=test yarn docker:test:run       # Run tests in container
ENV=test yarn docker:test:coverage  # Generate coverage in container
```

### Writing Tests

- Write unit tests for all new functions and methods
- Add integration tests for new API endpoints
- Use descriptive test names
- Aim for >80% code coverage
- Mock external dependencies

## Docker Development

### Unified Docker Setup

The project now uses a single `docker-compose.yml` file controlled by environment variables:

```bash
# Development
ENV=development docker compose up -d

# Testing
ENV=test docker compose up -d

# Production
ENV=production docker compose up -d
```

### Environment Configuration

Environment-specific configurations are in `config/environments/`:

- `development.env` - Development settings
- `test.env` - Testing settings
- `production.env` - Production settings

### Adding New Language Support

1. Create `docker/executors/Dockerfile.{language}`
2. Update `scripts/build-executors.sh`
3. Add language validation in validators
4. Update Swagger documentation
5. Add tests for the new language

## Security

- Never commit sensitive data (passwords, keys, tokens)
- Validate all inputs using express-validator
- Use proper authentication for protected endpoints
- Implement rate limiting for public APIs
- Sanitize error messages

## Performance

- Use proper database indexes
- Leverage Redis for caching
- Set appropriate Docker resource limits
- Use BullMQ for background processing

## Bug Reports

Great bug reports include:

- A quick summary and background
- Steps to reproduce (be specific!)
- Expected vs actual behavior
- System information (OS, Node.js version, etc.)
- Error logs and stack traces

## Questions?

Feel free to open an issue if you have questions about contributing!

## License

By contributing, you agree that your contributions will be licensed under its MIT License.
