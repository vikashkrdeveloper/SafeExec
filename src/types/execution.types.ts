export enum Language {
  PYTHON = 'python',
  JAVASCRIPT = 'javascript',
  CPP = 'cpp',
  JAVA = 'java',
  GO = 'go',
}

export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  TIMEOUT = 'timeout',
  MEMORY_EXCEEDED = 'memory_exceeded',
}

export interface ExecutionResult {
  status: ExecutionStatus;
  output?: string;
  error?: string;
  executionTime?: number;
  memoryUsed?: number;
  exitCode?: number;
}

export interface TestCaseResult {
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed: boolean;
  executionTime?: number;
  error?: string;
}

export interface SubmissionResult {
  submissionId: string;
  problemId: string;
  userId: string;
  language: Language;
  code: string;
  status: ExecutionStatus;
  testResults: TestCaseResult[];
  totalTestCases: number;
  passedTestCases: number;
  executionTime?: number;
  memoryUsed?: number;
  score?: number;
}

export interface ExecutorConfig {
  image: string;
  timeout: number;
  memoryLimit: string;
  cpuLimit: string;
}

export interface DockerExecutionOptions {
  language: Language;
  code: string;
  input?: string;
  timeout?: number;
  memoryLimit?: string;
}
