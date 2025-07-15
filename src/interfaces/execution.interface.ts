import { Language, ExecutionStatus } from '../types';

export interface IExecutor {
  execute(code: string, input?: string): Promise<ExecutionResult>;
  validateCode(code: string): boolean;
  getLanguage(): Language;
}

export interface ExecutionResult {
  status: ExecutionStatus;
  output?: string;
  error?: string;
  executionTime?: number;
  memoryUsed?: number;
  exitCode?: number;
}

export interface ITestCaseExecutor {
  executeTestCases(
    code: string,
    testCases: TestCase[]
  ): Promise<TestCaseResult[]>;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  timeLimit?: number;
  memoryLimit?: number;
}

export interface TestCaseResult {
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed: boolean;
  executionTime?: number;
  error?: string;
}
