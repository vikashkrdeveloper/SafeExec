# Development Setup Guide

This guide will help you set up the RCE Backend for local development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18 or higher
- **Yarn** package manager
- **Docker** and **Docker Compose**
- **Git**

## Environment Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd RceBackend
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit the `.env` file with your local configuration:

```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/rce-backend
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-development-secret-key
CORS_ORIGIN=http://localhost:3000
```

### 4. Start Docker Services

```bash
yarn docker:up
```

This will start:

- MongoDB
- Redis
- Nginx (if configured)

### 5. Build Executor Images

```bash
yarn build:executors
```

### 6. Seed Database (Optional)

```bash
yarn seed
```

### 7. Start Development Server

```bash
yarn dev
```

The API will be available at `http://localhost:3001`

## Development Workflow

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Check linting
yarn lint

# Auto-fix linting issues
yarn lint:fix

# Format code
yarn format

# Check formatting
yarn format:check
```

### Testing

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage

# Run only integration tests
yarn test:integration
```

### TypeScript

```bash
# Type checking without emitting files
yarn typecheck

# Build TypeScript
yarn build
```

## Project Structure for Developers

### Source Code Organization

```
src/
├── config/
│   ├── db.ts           # Database connection
│   └── env.ts          # Environment variables
├── constants/
│   └── index.ts        # App constants
├── controllers/
│   ├── auth.controller.ts
│   ├── problem.controller.ts
│   └── submission.controller.ts
├── executors/
│   ├── dockerExecutor.ts
│   └── secureDockerExecutor.ts
├── interfaces/
│   ├── database.interface.ts
│   ├── execution.interface.ts
│   └── service.interface.ts
├── middleware/
│   └── auth.middleware.ts
├── models/
│   ├── problem.model.ts
│   ├── submission.model.ts
│   └── user.model.ts
├── queue/
│   ├── producer.ts
│   ├── queue.ts
│   └── worker.ts
├── routes/
│   ├── auth.routes.ts
│   ├── problem.routes.ts
│   └── submission.routes.ts
├── services/
│   ├── auth.service.ts
│   └── submit.service.ts
├── types/
│   ├── auth.types.ts
│   ├── common.types.ts
│   └── execution.types.ts
├── utils/
│   ├── logger.ts
│   └── seedProblems.ts
├── validators/
│   ├── auth.validator.ts
│   ├── common.validator.ts
│   ├── problem.validator.ts
│   └── submission.validator.ts
└── index.ts
```

### Key Development Files

- **Entry Point**: `src/index.ts`
- **Database Models**: `src/models/`
- **API Routes**: `src/routes/`
- **Business Logic**: `src/services/`
- **Type Definitions**: `src/types/` and `src/interfaces/`
- **Validation**: `src/validators/`
- **Code Execution**: `src/executors/`

## Common Development Tasks

### Adding a New API Endpoint

1. Create the route in `src/routes/`
2. Add controller logic in `src/controllers/`
3. Add validation in `src/validators/`
4. Update types/interfaces if needed
5. Add tests

### Adding a New Language Executor

1. Create Dockerfile in `docker/executors/`
2. Update language configs in `src/executors/secureDockerExecutor.ts`
3. Add language constant in `src/constants/`
4. Update validation rules
5. Add tests for the new language

### Database Changes

1. Update model in `src/models/`
2. Update TypeScript interfaces
3. Create migration script if needed
4. Update seed data
5. Add tests

## Debugging

### VS Code Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug RCE Backend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/index.ts",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "runtimeArgs": ["-r", "ts-node/register"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

### Logging

We use Winston for logging. Configure log levels in your `.env`:

```env
LOG_LEVEL=debug
```

Available levels: `error`, `warn`, `info`, `debug`

### Docker Debugging

```bash
# View container logs
docker-compose logs -f api
docker-compose logs -f worker

# Access container shell
docker-compose exec api sh

# Check running containers
docker ps

# View executor container logs
docker logs <container-id>
```

## Performance Considerations

- Use proper TypeScript types for better IDE support
- Implement caching where appropriate
- Monitor memory usage in executor containers
- Use database indexes for frequently queried fields
- Implement proper error handling and logging

## Security Guidelines

- Never commit sensitive data to git
- Use environment variables for configuration
- Validate all user inputs
- Implement proper authentication checks
- Follow principle of least privilege for Docker containers
- Regular dependency updates

## Troubleshooting

### Common Issues

1. **Port already in use**: Check if another process is using port 3001
2. **Docker permission denied**: Add user to docker group
3. **MongoDB connection failed**: Ensure MongoDB is running
4. **Redis connection failed**: Ensure Redis is running
5. **TypeScript errors**: Run `yarn typecheck` to see detailed errors

### Getting Help

- Check the main README.md for general information
- Review test files for usage examples
- Check GitHub issues for known problems
- Use TypeScript compiler for type checking
