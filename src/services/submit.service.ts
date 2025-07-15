import {
  SecureDockerExecutor,
  ExecutionRequest,
} from '../executors/secureDockerExecutor';
import { SubmissionModel } from '../models/submission.model';
import { ProblemModel } from '../models/problem.model';
import { logger } from '../utils/logger';

export class SubmissionService {
  private executor: SecureDockerExecutor;

  constructor() {
    this.executor = new SecureDockerExecutor();
  }

  async submitCode(
    problemId: string,
    language: string,
    code: string,
    userId: string
  ): Promise<{
    submissionId: string;
    status: string;
    result?: unknown;
  }> {
    try {
      logger.info(
        `New submission: problemId=${problemId}, language=${language}, userId=${userId}`
      );

      // Get problem details
      const problem = await ProblemModel.findById(problemId);
      if (!problem) {
        throw new Error('Problem not found');
      }

      // Check if language is allowed
      if (!problem.allowedLanguages.includes(language)) {
        throw new Error(`Language ${language} not allowed for this problem`);
      }

      // Create submission record with userId
      const submission = await SubmissionModel.create({
        problemId,
        userId,
        language,
        code,
        status: 'pending',
        createdAt: new Date(),
      });

      logger.info(`Created submission ${submission._id}`);

      // Execute code
      const executionRequest: ExecutionRequest = {
        code,
        language,
        input: '', // You can add test cases here
        timeLimit: problem.timeLimitMs,
        memoryLimit: problem.memoryLimitMB * 1024 * 1024, // Convert to bytes
      };

      const result = await this.executor.executeCode(executionRequest);

      // Update submission with results
      submission.status = result.success ? 'completed' : 'failed';
      submission.result = {
        success: result.success,
        output: result.output || '',
        error: result.error || '',
        executionTime: result.executionTime || 0,
        memoryUsed: result.memoryUsed || 0,
        testCasesPassed: 0,
        totalTestCases: 0,
      };

      // Update timing
      if (submission.timing) {
        submission.timing.completedAt = new Date();
        submission.timing.executionTime = result.executionTime || 0;
      }

      await submission.save();

      logger.info(
        `Submission ${submission._id} completed: success=${result.success}`
      );

      return {
        submissionId: submission._id.toString(),
        status: submission.status,
        result: submission.result,
      };
    } catch (error: unknown) {
      logger.error('Submission error:', error);
      throw error;
    }
  }

  async getSubmission(submissionId: string): Promise<unknown> {
    const submission = await SubmissionModel.findById(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }

    return {
      submissionId: submission._id,
      problemId: submission.problemId,
      language: submission.language,
      code: submission.code,
      status: submission.status,
      result: submission.result,
      timing: submission.timing,
      security: submission.security,
      metadata: submission.metadata,
    };
  }

  async getUserSubmissions(userId?: string, limit = 50): Promise<unknown[]> {
    const filter = userId ? { userId } : {};
    const submissions = await SubmissionModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('problemId', 'title slug difficulty');

    return submissions.map((submission) => ({
      submissionId: submission._id,
      problem: submission.problemId,
      language: submission.language,
      status: submission.status,
      result: submission.result,
      timing: submission.timing,
    }));
  }

  async getExecutorStats(): Promise<{
    totalImages: number;
    totalContainers: number;
    runningContainers: number;
    supportedLanguages: string[];
  }> {
    return await this.executor.getExecutorStats();
  }

  async cleanup(): Promise<void> {
    await this.executor.cleanup();
  }
}

export const enqueueSubmission = async (submissionId: string) => {
  // Legacy function for backward compatibility
  console.log(`Legacy enqueue called for submission ${submissionId}`);
};
