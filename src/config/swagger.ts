import swaggerJSDoc, { Options } from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

/**
 * Swagger configuration for SafeExec API
 * Provides comprehensive API documentation with interactive UI
 */
const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SafeExec API - Secure Code Execution Platform',
      version: '1.0.0',
      description: `
  ## SafeExec API Documentation

  **SafeExec** is an enterprise-grade, open-source secure code execution platform that enables isolated execution of code in multiple programming languages with Docker-containerized environments.
  This API provides endpoints for user authentication, code execution, problem submission, and system health monitoring.

  ---

  *Built with ❤️ by [Vikash Kumar](https://github.com/vikashkrdeveloper) and the SafeExec community*
      `,
      contact: {
        name: 'SafeExec Development Team',
        url: 'https://github.com/vikashkrdeveloper/SafeExec',
        email: 'vikashkrdeveloper@gmail.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:5000',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'Enter your JWT token received from login endpoint. Format: Bearer <token>',
        },
      },
      schemas: {
        // ========================================
        // Authentication & User Management Schemas
        // ========================================
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
              example: 'vikash_dev',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Valid email address for account verification',
              example: 'vikash@safeexec.dev',
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'Strong password (minimum 6 characters)',
              example: 'SecurePass123!',
            },
            firstName: {
              type: 'string',
              description: 'First name (optional)',
              example: 'Vikash',
            },
            lastName: {
              type: 'string',
              description: 'Last name (optional)',
              example: 'Kumar',
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
              example: 'vikash@safeexec.dev',
            },
            password: {
              type: 'string',
              description: 'Account password',
              example: 'SecurePass123!',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Success message',
              example: 'Login successful',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
            token: {
              type: 'string',
              description: 'JWT access token for API authentication',
              example:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZjIxYjQ2NjdkMGQ4OTkyZTYxMGM4NSIsInVzZXJuYW1lIjoidmlrYXNoX2RldiIsImVtYWlsIjoidmlrYXNoQHNhZmVleGVjLmRldiIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzEwNDEyODAwLCJleHAiOjE3MTA0OTkyMDB9.abc123...',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User unique identifier',
              example: '65f21b4667d0d8992e610c85',
            },
            username: {
              type: 'string',
              description: 'Unique username',
              example: 'vikash_dev',
            },
            email: {
              type: 'string',
              description: 'Email address',
              example: 'vikash@safeexec.dev',
            },
            role: {
              type: 'string',
              enum: ['user', 'admin', 'moderator'],
              description: 'User role and permissions level',
              example: 'user',
            },
            profile: {
              type: 'object',
              properties: {
                firstName: { type: 'string', example: 'Vikash' },
                lastName: { type: 'string', example: 'Kumar' },
                bio: {
                  type: 'string',
                  example:
                    'Full-stack developer passionate about secure code execution',
                },
                avatar: {
                  type: 'string',
                  format: 'uri',
                  example: 'https://avatar.url/vikash.jpg',
                },
              },
            },
            stats: {
              type: 'object',
              properties: {
                totalSubmissions: { type: 'number', example: 42 },
                successfulSubmissions: { type: 'number', example: 38 },
                preferredLanguage: { type: 'string', example: 'python' },
                lastActive: { type: 'string', format: 'date-time' },
              },
            },
            isActive: {
              type: 'boolean',
              description: 'Account status',
              example: true,
            },
            emailVerified: {
              type: 'boolean',
              description: 'Email verification status',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp',
            },
          },
        },

        // ========================================
        // Code Execution Schemas
        // ========================================
        CodeExecutionRequest: {
          type: 'object',
          required: ['language', 'code'],
          properties: {
            language: {
              type: 'string',
              enum: ['python', 'javascript', 'java', 'cpp', 'go'],
              description: 'Programming language for code execution',
              example: 'python',
            },
            code: {
              type: 'string',
              maxLength: 10000,
              description: 'Source code to execute (maximum 10,000 characters)',
              example:
                'print("Hello, SafeExec!")\nprint("Current time:", __import__("datetime").datetime.now())\n\n# Simple calculation\nresult = sum(range(1, 11))\nprint(f"Sum of 1-10: {result}")',
            },
            input: {
              type: 'string',
              description: 'Standard input for the program (optional)',
              example: '5\n10\n15',
            },
            timeLimit: {
              type: 'integer',
              minimum: 1000,
              maximum: 30000,
              description: 'Maximum execution time in milliseconds (1s - 30s)',
              example: 5000,
            },
            memoryLimit: {
              type: 'integer',
              minimum: 64,
              maximum: 512,
              description: 'Maximum memory usage in MB (64MB - 512MB)',
              example: 128,
            },
          },
        },
        CodeExecutionResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Execution success status',
              example: true,
            },
            data: {
              type: 'object',
              properties: {
                executionId: {
                  type: 'string',
                  description: 'Unique execution identifier',
                  example: 'exec_1710412800_abc123def',
                },
                output: {
                  type: 'string',
                  description: 'Program standard output',
                  example:
                    'Hello, SafeExec!\nCurrent time: 2024-03-14 10:30:00.123456\nSum of 1-10: 55',
                },
                error: {
                  type: 'string',
                  description: 'Error message (if any)',
                  example: '',
                },
                executionTime: {
                  type: 'number',
                  description: 'Actual execution time in milliseconds',
                  example: 125,
                },
                memoryUsage: {
                  type: 'number',
                  description: 'Memory used in bytes',
                  example: 8388608,
                },
                status: {
                  type: 'string',
                  enum: ['success', 'error', 'timeout', 'memory_exceeded'],
                  description: 'Execution result status',
                  example: 'success',
                },
                language: {
                  type: 'string',
                  description: 'Programming language used',
                  example: 'python',
                },
              },
            },
          },
        },

        // ========================================
        // Problem & Submission Schemas
        // ========================================
        SubmissionRequest: {
          type: 'object',
          required: ['problemId', 'language', 'code'],
          properties: {
            problemId: {
              type: 'string',
              description: 'Problem identifier to solve',
              example: '65f21b4667d0d8992e610c85',
            },
            language: {
              type: 'string',
              enum: ['python', 'javascript', 'java', 'cpp', 'go'],
              description: 'Programming language for submission',
              example: 'python',
            },
            code: {
              type: 'string',
              maxLength: 50000,
              description: 'Solution source code (maximum 50,000 characters)',
              example:
                'def solution(nums, target):\n    """Two Sum problem solution"""\n    num_map = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in num_map:\n            return [num_map[complement], i]\n        num_map[num] = i\n    return []',
            },
          },
        },
        SubmissionResponse: {
          type: 'object',
          properties: {
            submissionId: {
              type: 'string',
              description: 'Unique submission identifier for tracking',
              example: '65f21b4667d0d8992e610c86',
            },
            status: {
              type: 'string',
              enum: [
                'pending',
                'running',
                'completed',
                'failed',
                'timeout',
                'memory_exceeded',
              ],
              description: 'Current submission processing status',
              example: 'pending',
            },
            result: {
              type: 'object',
              nullable: true,
              properties: {
                success: {
                  type: 'boolean',
                  description: 'Overall submission success',
                  example: true,
                },
                output: {
                  type: 'string',
                  description: 'Program output',
                  example: '[0, 1]',
                },
                error: {
                  type: 'string',
                  description: 'Error message if failed',
                  example: '',
                },
                executionTime: {
                  type: 'number',
                  description: 'Execution time in milliseconds',
                  example: 89,
                },
                memoryUsage: {
                  type: 'number',
                  description: 'Memory usage in bytes',
                  example: 12582912,
                },
                testsPassed: {
                  type: 'number',
                  description: 'Number of test cases passed',
                  example: 15,
                },
                totalTests: {
                  type: 'number',
                  description: 'Total number of test cases',
                  example: 15,
                },
                score: {
                  type: 'number',
                  description: 'Submission score (0-100)',
                  example: 100,
                },
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Submission creation timestamp',
            },
          },
        },
        Problem: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Problem unique identifier',
              example: '65f21b4667d0d8992e610c85',
            },
            title: {
              type: 'string',
              description: 'Problem title',
              example: 'Two Sum',
            },
            slug: {
              type: 'string',
              description: 'URL-friendly problem identifier',
              example: 'two-sum',
            },
            description: {
              type: 'string',
              description: 'Detailed problem description with examples',
              example:
                'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
            },
            difficulty: {
              type: 'string',
              enum: ['easy', 'medium', 'hard'],
              description: 'Problem difficulty level',
              example: 'easy',
            },
            constraints: {
              type: 'array',
              items: { type: 'string' },
              description: 'Problem constraints and limitations',
              example: [
                '2 <= nums.length <= 10^4',
                '-10^9 <= nums[i] <= 10^9',
                '-10^9 <= target <= 10^9',
                'Only one valid answer exists',
              ],
            },
            allowedLanguages: {
              type: 'array',
              items: { type: 'string' },
              description: 'Programming languages allowed for this problem',
              example: ['python', 'javascript', 'java', 'cpp', 'go'],
            },
            timeLimitMs: {
              type: 'number',
              description: 'Time limit for execution in milliseconds',
              example: 2000,
            },
            memoryLimitMB: {
              type: 'number',
              description: 'Memory limit in megabytes',
              example: 256,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Problem creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },

        // ========================================
        // System & Utility Schemas
        // ========================================
        HealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['healthy', 'degraded', 'unhealthy'],
              description: 'Overall system health status',
              example: 'healthy',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Health check timestamp',
              example: '2024-03-14T10:30:00.000Z',
            },
            uptime: {
              type: 'number',
              description: 'Server uptime in seconds',
              example: 3600.123,
            },
            version: {
              type: 'string',
              description: 'Application version',
              example: '1.0.0',
            },
            environment: {
              type: 'string',
              description: 'Current environment',
              example: 'development',
            },
            services: {
              type: 'object',
              properties: {
                database: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'connected' },
                    responseTime: { type: 'number', example: 15 },
                  },
                },
                redis: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'connected' },
                    responseTime: { type: 'number', example: 8 },
                  },
                },
                docker: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'available' },
                    containers: { type: 'number', example: 5 },
                  },
                },
              },
            },
          },
        },
        ExecutorStats: {
          type: 'object',
          properties: {
            totalSubmissions: {
              type: 'integer',
              description: 'Total number of code submissions processed',
              example: 15420,
            },
            successfulSubmissions: {
              type: 'integer',
              description: 'Number of successful submissions',
              example: 12330,
            },
            failedSubmissions: {
              type: 'integer',
              description: 'Number of failed submissions',
              example: 3090,
            },
            averageExecutionTime: {
              type: 'number',
              description: 'Average execution time in milliseconds',
              example: 245.7,
            },
            queueLength: {
              type: 'integer',
              description: 'Current number of pending submissions',
              example: 3,
            },
            activeExecutors: {
              type: 'integer',
              description: 'Number of active Docker executor containers',
              example: 5,
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
              description: 'Submission count by programming language',
            },
            supportedLanguages: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of all supported programming languages',
              example: ['python', 'javascript', 'java', 'cpp', 'go'],
            },
          },
        },

        // ========================================
        // Generic Response Schemas
        // ========================================
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
              description: 'Response data (structure varies by endpoint)',
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
              description: 'Human-readable error message',
              example: 'Invalid request parameters',
            },
            code: {
              type: 'string',
              description: 'Machine-readable error code for client handling',
              example: 'VALIDATION_ERROR',
            },
            details: {
              type: 'object',
              description: 'Additional error context (optional)',
            },
          },
        },

        // ========================================
        // Rate Limiting & Validation Schemas
        // ========================================
        RateLimitResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              example: 'Rate limit exceeded',
            },
            retryAfter: {
              type: 'number',
              description: 'Seconds until rate limit resets',
              example: 60,
            },
            limit: {
              type: 'number',
              description: 'Maximum requests allowed',
              example: 100,
            },
            remaining: {
              type: 'number',
              description: 'Remaining requests in current window',
              example: 0,
            },
          },
        },
        ValidationErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              example: 'Validation failed',
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'email' },
                  message: { type: 'string', example: 'Invalid email format' },
                  code: { type: 'string', example: 'INVALID_FORMAT' },
                },
              },
            },
          },
        },
      },
    },
    tags: [],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts', './src/models/*.ts'],
};

// Generate OpenAPI spec
const swaggerSpec = swaggerJSDoc(swaggerOptions);

/**
 * Setup Swagger documentation for Express app
 * @param app Express application instance
 */
export const setupSwagger = (app: Express): void => {
  // Swagger UI options for professional appearance
  const swaggerUiOptions = {
    explorer: true,
    customCss: `
      body {
        background-color: #fff;
      }
      .swagger-ui .topbar {
        display: none;
      }
      .swagger-ui .info {
        background: #fff;
        color: #222 !important;
        border-radius: 8px;
        margin: 30px 0;
        padding: 20px;
      }
      .swagger-ui .scheme-container {
        background-color: #fff;
        padding: 25px;
        margin: 25px 0;
        color: #222 !important;
        border-radius: 8px;
      }
      .swagger-ui .opblock.opblock-post {
        border-color: #007bff;
        background: rgba(0,123,255,.05);
      }
      .swagger-ui .opblock.opblock-get {
        border-color: #28a745;
        background: rgba(40,167,69,.05);
      }
      .swagger-ui .opblock.opblock-put {
        border-color: #ffc107;
        background: rgba(255,193,7,.05);
      }
      .swagger-ui .opblock.opblock-delete {
        border-color: #dc3545;
        background: rgba(220,53,69,.05);
      }
      .swagger-ui .opblock-tag {
        font-size: 18px !important;
        font-weight: 600;
        margin: 20px 0;
        color: #343a40;
      }
      .swagger-ui .authorization__btn {
        background: #007bff;
        color: #fff;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        font-weight: 500;
      }
      .swagger-ui .authorization__btn:hover {
        background: #0056b3;
      }
      .swagger-ui .btn.execute {
        background: #28a745;
        border-color: #28a745;
        color: #fff;
        font-weight: 500;
      }
      .swagger-ui .btn.execute:hover {
        background: #218838;
        border-color: #218838;
      }
    `,
    customSiteTitle:
      'SafeExec API Documentation - Secure Code Execution Platform',
    customfavIcon: '/favicon.ico',
    customJs: [
      'https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js',
      '/swagger-custom.js',
    ],
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
      requestInterceptor: `(request) => {
        request.headers['X-Client'] = 'SafeExec-Swagger-UI';
        return request;
      }`,
      responseInterceptor: `(response) => {
        // Add response time tracking
        if (response.headers['x-response-time']) {
          console.log('API Response Time:', response.headers['x-response-time']);
        }
        return response;
      }`,
      validatorUrl: null,
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      defaultModelRendering: 'example',
    },
  };

  // Serve Swagger UI
  app.use('/api-docs', swaggerUi.serve);
  app.get('/api-docs', swaggerUi.setup(swaggerSpec, swaggerUiOptions));
};

export { swaggerSpec };
