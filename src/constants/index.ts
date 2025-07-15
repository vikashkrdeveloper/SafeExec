export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const LANGUAGES = {
  PYTHON: 'python',
  JAVASCRIPT: 'javascript',
  CPP: 'cpp',
  JAVA: 'java',
  GO: 'go',
} as const;

export const EXECUTION_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  TIMEOUT: 'timeout',
  MEMORY_EXCEEDED: 'memory_exceeded',
} as const;

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
} as const;

export const QUEUE_NAMES = {
  SUBMISSION: 'submission-queue',
  EXECUTION: 'execution-queue',
} as const;

export const RATE_LIMITS = {
  SUBMISSION: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 submissions per 15 minutes
  },
  API: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
  },
} as const;

export const EXECUTION_LIMITS = {
  TIMEOUT: 10000, // 10 seconds
  MEMORY: '256m',
  CPU: '0.5',
} as const;

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  CODE_MAX_LENGTH: 100000, // 100KB
} as const;
