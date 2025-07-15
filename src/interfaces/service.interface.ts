import {
  ExecutionResult,
  TestCase,
  TestCaseResult,
} from './execution.interface';

export interface IAuthService {
  register(userData: RegisterData): Promise<AuthUser>;
  login(
    credentials: LoginCredentials
  ): Promise<{ user: AuthUser; token: string }>;
  verifyToken(token: string): Promise<AuthUser>;
  refreshToken(refreshToken: string): Promise<string>;
  logout(userId: string): Promise<void>;
}

export interface ISubmissionService {
  submitCode(submissionData: SubmissionData): Promise<SubmissionResult>;
  getSubmission(submissionId: string): Promise<SubmissionResult | null>;
  getUserSubmissions(userId: string): Promise<SubmissionResult[]>;
  getProblemSubmissions(problemId: string): Promise<SubmissionResult[]>;
}

export interface IProblemService {
  createProblem(problemData: ProblemData): Promise<Problem>;
  getProblem(problemId: string): Promise<Problem | null>;
  getProblems(filters?: ProblemFilters): Promise<Problem[]>;
  updateProblem(
    problemId: string,
    data: Partial<ProblemData>
  ): Promise<Problem | null>;
  deleteProblem(problemId: string): Promise<boolean>;
}

export interface IExecutionService {
  executeCode(
    code: string,
    language: string,
    input?: string
  ): Promise<ExecutionResult>;
  executeTestCases(
    code: string,
    language: string,
    testCases: TestCase[]
  ): Promise<TestCaseResult[]>;
}

export interface IQueueService {
  addJob(
    queueName: string,
    data: unknown,
    options?: JobOptions
  ): Promise<string>;
  processJob(queueName: string, processor: JobProcessor): void;
  getJobStatus(jobId: string): Promise<JobStatus>;
}

// Supporting interfaces
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubmissionResult {
  submissionId: string;
  problemId: string;
  userId: string;
  language: string;
  code: string;
  status: string;
  testResults: TestCaseResult[];
  totalTestCases: number;
  passedTestCases: number;
  executionTime?: number;
  memoryUsed?: number;
  score?: number;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SubmissionData {
  problemId: string;
  userId: string;
  code: string;
  language: string;
}

export interface ProblemData {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  testCases: TestCase[];
  constraints?: string;
  examples?: Example[];
}

export interface ProblemFilters {
  difficulty?: string;
  tags?: string[];
  search?: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  tags: string[];
  testCases: TestCase[];
  constraints?: string;
  examples?: Example[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface JobOptions {
  delay?: number;
  attempts?: number;
  backoff?: string | { type: string; delay: number };
  priority?: number;
}

export interface JobProcessor {
  (job: { data: unknown; id: string }): Promise<unknown>;
}

export interface JobStatus {
  id: string;
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
  progress?: number;
  result?: unknown;
  error?: unknown;
}
