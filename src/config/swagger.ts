import * as swaggerJSDoc from 'swagger-jsdoc';
import * as swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

/**
 * Swagger configuration for RCE Backend API
 * Provides comprehensive API documentation with interactive UI
 */
const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RCE Backend API',
      version: '1.0.0',
      description: `
# Remote Code Execution (RCE) Backend API

A secure and scalable backend service for executing code in multiple programming languages.

## Features

- 🔒 **Secure Code Execution** - Sandboxed Docker containers
- 🌐 **Multi-Language Support** - Python, JavaScript, Java, C++, Go
- 📊 **Real-time Monitoring** - Execution statistics and performance metrics
- 🚀 **High Performance** - Queue-based processing with Redis
- 🔐 **Authentication** - JWT-based secure access
- 📝 **Problem Management** - CRUD operations for coding problems
- 🏆 **Submission Tracking** - Complete submission history and analytics

## Security

All code execution happens in isolated Docker containers with:
- Limited memory and CPU resources
- Network isolation
- Time-based execution limits
- No access to host filesystem

## Getting Started

1. Register a new account using \`POST /api/auth/register\`
2. Login to get your JWT token using \`POST /api/auth/login\`
3. Include the token in Authorization header: \`Bearer YOUR_TOKEN\`
4. Start executing code with \`POST /api/submit\`
      `,
      contact: {
        name: 'RCE Backend Team',
        url: 'https://github.com/your-repo/rce-backend',
        email: 'support@rce-backend.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://api.rce-backend.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token received from login',
        },
      },
      schemas: {
        // Authentication Schemas
        RegisterRequest: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            username: {
              type: 'string',
              minLength: 3,
              maxLength: 30,
              pattern: '^[a-zA-Z0-9_]+$',
              description: 'Unique username (alphanumeric and underscore only)',
              example: 'john_doe',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Valid email address',
              example: 'john@example.com',
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'Password (minimum 6 characters)',
              example: 'securePassword123',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Registered email address',
              example: 'john@example.com',
            },
            password: {
              type: 'string',
              description: 'Account password',
              example: 'securePassword123',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Request success status',
            },
            message: {
              type: 'string',
              description: 'Response message',
            },
            data: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                  description: 'JWT access token',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
                user: {
                  $ref: '#/components/schemas/User',
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User unique identifier',
              example: '60d21b4667d0d8992e610c85',
            },
            username: {
              type: 'string',
              description: 'Username',
              example: 'john_doe',
            },
            email: {
              type: 'string',
              description: 'Email address',
              example: 'john@example.com',
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'User role',
              example: 'user',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp',
            },
          },
        },
        // Code Execution Schemas
        SubmitCodeRequest: {
          type: 'object',
          required: ['problemId', 'language', 'code'],
          properties: {
            problemId: {
              type: 'string',
              description: 'Problem identifier',
              example: '60d21b4667d0d8992e610c85',
            },
            language: {
              type: 'string',
              enum: ['python', 'javascript', 'java', 'cpp', 'go'],
              description: 'Programming language',
              example: 'python',
            },
            code: {
              type: 'string',
              maxLength: 10000,
              description: 'Source code to execute (max 10,000 characters)',
              example:
                'def two_sum(nums, target):\n    for i in range(len(nums)):\n        for j in range(i + 1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]\n    return []',
            },
          },
        },
        ExecutionResult: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Request success status',
            },
            data: {
              type: 'object',
              properties: {
                submissionId: {
                  type: 'string',
                  description: 'Unique submission identifier',
                  example: '60d21b4667d0d8992e610c85',
                },
                status: {
                  type: 'string',
                  enum: [
                    'accepted',
                    'wrong_answer',
                    'runtime_error',
                    'time_limit_exceeded',
                    'compilation_error',
                  ],
                  description: 'Execution status',
                  example: 'accepted',
                },
                executionTime: {
                  type: 'number',
                  description: 'Execution time in milliseconds',
                  example: 125,
                },
                memoryUsed: {
                  type: 'number',
                  description: 'Memory used in bytes',
                  example: 1024000,
                },
                output: {
                  type: 'string',
                  description: 'Program output',
                  example: '[0, 1]',
                },
                error: {
                  type: 'string',
                  description: 'Error message (if any)',
                  example: '',
                },
                testCases: {
                  type: 'object',
                  properties: {
                    passed: {
                      type: 'integer',
                      description: 'Number of test cases passed',
                      example: 10,
                    },
                    total: {
                      type: 'integer',
                      description: 'Total number of test cases',
                      example: 10,
                    },
                  },
                },
              },
            },
          },
        },
        // Problem Schemas
        Problem: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Problem unique identifier',
              example: '60d21b4667d0d8992e610c85',
            },
            title: {
              type: 'string',
              description: 'Problem title',
              example: 'Two Sum',
            },
            description: {
              type: 'string',
              description: 'Problem description',
              example:
                'Given an array of integers and a target sum, return indices of two numbers that add up to the target.',
            },
            difficulty: {
              type: 'string',
              enum: ['easy', 'medium', 'hard'],
              description: 'Problem difficulty level',
              example: 'easy',
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Problem tags',
              example: ['array', 'hash-table'],
            },
            examples: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  input: { type: 'string', example: '[2,7,11,15], 9' },
                  output: { type: 'string', example: '[0,1]' },
                  explanation: {
                    type: 'string',
                    example: 'nums[0] + nums[1] = 2 + 7 = 9',
                  },
                },
              },
              description: 'Example inputs and outputs',
            },
            constraints: {
              type: 'array',
              items: { type: 'string' },
              description: 'Problem constraints',
              example: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9'],
            },
            testCases: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  input: { type: 'string' },
                  expectedOutput: { type: 'string' },
                  isHidden: { type: 'boolean' },
                },
              },
              description: 'Test cases for validation',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Problem creation timestamp',
            },
          },
        },
        // Submission Schemas
        Submission: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Submission unique identifier',
              example: '60d21b4667d0d8992e610c85',
            },
            userId: {
              type: 'string',
              description: 'User who made the submission',
              example: '60d21b4667d0d8992e610c85',
            },
            problemId: {
              type: 'string',
              description: 'Problem identifier',
              example: '60d21b4667d0d8992e610c85',
            },
            language: {
              type: 'string',
              description: 'Programming language used',
              example: 'python',
            },
            code: {
              type: 'string',
              description: 'Submitted source code',
            },
            status: {
              type: 'string',
              enum: [
                'accepted',
                'wrong_answer',
                'runtime_error',
                'time_limit_exceeded',
                'compilation_error',
              ],
              description: 'Submission status',
              example: 'accepted',
            },
            executionTime: {
              type: 'number',
              description: 'Execution time in milliseconds',
              example: 125,
            },
            memoryUsed: {
              type: 'number',
              description: 'Memory used in bytes',
              example: 1024000,
            },
            testResults: {
              type: 'object',
              properties: {
                passed: { type: 'integer', example: 10 },
                total: { type: 'integer', example: 10 },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      input: { type: 'string' },
                      expectedOutput: { type: 'string' },
                      actualOutput: { type: 'string' },
                      passed: { type: 'boolean' },
                    },
                  },
                },
              },
            },
            submittedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Submission timestamp',
            },
          },
        },
        // Generic Response Schemas
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully',
            },
            data: {
              type: 'object',
              description: 'Response data (varies by endpoint)',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              description: 'Error message',
              example: 'Invalid request parameters',
            },
            details: {
              type: 'object',
              description: 'Additional error details (optional)',
            },
          },
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'healthy',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Health check timestamp',
            },
            uptime: {
              type: 'number',
              description: 'Server uptime in seconds',
              example: 3600.5,
            },
          },
        },
        ExecutorStats: {
          type: 'object',
          properties: {
            totalExecutions: {
              type: 'integer',
              description: 'Total number of code executions',
              example: 15420,
            },
            successfulExecutions: {
              type: 'integer',
              description: 'Number of successful executions',
              example: 12330,
            },
            failedExecutions: {
              type: 'integer',
              description: 'Number of failed executions',
              example: 3090,
            },
            averageExecutionTime: {
              type: 'number',
              description: 'Average execution time in milliseconds',
              example: 245.7,
            },
            languageStats: {
              type: 'object',
              properties: {
                python: { type: 'integer', example: 5000 },
                javascript: { type: 'integer', example: 3500 },
                java: { type: 'integer', example: 2800 },
                cpp: { type: 'integer', example: 2100 },
                go: { type: 'integer', example: 2020 },
              },
              description: 'Execution count by programming language',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints',
      },
      {
        name: 'Code Execution',
        description: 'Code submission and execution endpoints',
      },
      {
        name: 'Problems',
        description: 'Problem management endpoints',
      },
      {
        name: 'Submissions',
        description: 'Submission history and analytics endpoints',
      },
      {
        name: 'Health',
        description: 'System health and monitoring endpoints',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts', './src/models/*.ts'],
};

// Generate OpenAPI spec
const swaggerSpec = swaggerJSDoc.default(swaggerOptions);

/**
 * Setup Swagger documentation for Express app
 * @param app Express application instance
 */
export const setupSwagger = (app: Express): void => {
  // Swagger UI options
  const swaggerUiOptions = {
    explorer: true,
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .info hgroup.main { margin: 0 0 20px 0; }
      .swagger-ui .info h1 { color: #3b4151; font-size: 36px; }
      .swagger-ui .info p { color: #3b4151; font-size: 14px; line-height: 1.4; }
      .swagger-ui .scheme-container { background: #fff; padding: 20px; margin: 20px 0; border-radius: 4px; border: 1px solid #d3d3d3; }
    `,
    customSiteTitle: 'RCE Backend API Documentation',
    customfavIcon: '/favicon.ico',
    customJs: '/swagger-custom.js',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showExtensions: true,
      tryItOutEnabled: true,
      validatorUrl: null,
    },
  };

  // Serve Swagger UI
  app.use('/api-docs', swaggerUi.serve);
  app.get('/api-docs', swaggerUi.setup(swaggerSpec, swaggerUiOptions));

  // Serve OpenAPI spec as JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('📚 Swagger documentation available at: /api-docs');
  console.log('📋 OpenAPI spec available at: /api-docs.json');
};

export { swaggerSpec };
