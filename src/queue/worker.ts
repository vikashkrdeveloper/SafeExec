// src/queue/worker.ts
import { Worker, WorkerOptions } from 'bullmq';
import { environmentConfig } from '../config/environment';
import { SubmissionModel } from '../models/submission.model';
import { SecureDockerExecutor } from '../executors/secureDockerExecutor';
import { logger } from '../utils/logger';

const config = environmentConfig.getConfig();

// Initialize the secure executor
const executor = new SecureDockerExecutor();

// Enhanced worker configuration for high throughput
const workerConfig: WorkerOptions = {
  connection: {
    host: config.redis.uri.includes('://')
      ? new URL(config.redis.uri).hostname
      : config.redis.uri.split(':')[0],
    port: config.redis.uri.includes('://')
      ? parseInt(new URL(config.redis.uri).port) || 6379
      : parseInt(config.redis.uri.split(':')[1]) || 6379,
    ...(config.redis.password && { password: config.redis.password }),
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    lazyConnect: true,
    family: 4,
    connectTimeout: 10000,
    commandTimeout: 5000,
  },
  concurrency: 10, // Process up to 10 jobs concurrently per worker
  removeOnComplete: { count: 100 },
  removeOnFail: { count: 50 },
};

// Processing function that can be reused
const processSubmission = async (submissionId: string) => {
  logger.info(`Processing submission: ${submissionId}`);

  try {
    const submission = await SubmissionModel.findById(submissionId);
    if (!submission) {
      throw new Error(`Submission not found: ${submissionId}`);
    }

    // Update submission status
    submission.status = 'running';
    if (!submission.timing) {
      submission.timing = {
        submittedAt: new Date(),
        startedAt: new Date(),
      };
    } else {
      submission.timing.startedAt = new Date();
    }
    await submission.save();

    // Execute code using secure executor
    const result = await executor.executeCode({
      code: submission.code,
      language: submission.language,
      input: '', // No test input for now
      timeLimit: config.executor.timeoutMs,
      memoryLimit: config.executor.memoryLimitMb,
    });

    // Update submission with results
    submission.status = result.success ? 'completed' : 'failed';
    if (!submission.result) {
      submission.result = {
        success: result.success,
        output: result.output,
        error: result.error,
        executionTime: result.executionTime || 0,
        memoryUsed: result.memoryUsed || 0,
        testCasesPassed: 0,
        totalTestCases: 0,
      };
    } else {
      submission.result.success = result.success;
      submission.result.output = result.output;
      submission.result.error = result.error;
      submission.result.executionTime = result.executionTime || 0;
      submission.result.memoryUsed = result.memoryUsed || 0;
    }

    if (!submission.timing) {
      submission.timing = {
        submittedAt: new Date(),
        completedAt: new Date(),
      };
    } else {
      submission.timing.completedAt = new Date();
    }

    await submission.save();

    logger.info(
      `Submission completed: ${submissionId}, success: ${result.success}`
    );
    return { submissionId, success: result.success };
  } catch (error) {
    logger.error(`Failed to process submission ${submissionId}:`, error);

    try {
      const submission = await SubmissionModel.findById(submissionId);
      if (submission) {
        submission.status = 'failed';
        if (!submission.result) {
          submission.result = {
            success: false,
            output: '',
            error: error instanceof Error ? error.message : 'Unknown error',
            executionTime: 0,
            memoryUsed: 0,
            testCasesPassed: 0,
            totalTestCases: 0,
          };
        } else {
          submission.result.error =
            error instanceof Error ? error.message : 'Unknown error';
        }
        await submission.save();
      }
    } catch (updateError) {
      logger.error(
        `Failed to update submission ${submissionId} with error:`,
        updateError
      );
    }

    throw error;
  }
};

// Main submission worker
const submissionWorker = new Worker(
  'submission',
  async (job) => {
    const { submissionId } = job.data;
    return await processSubmission(submissionId);
  },
  workerConfig
);

// Priority worker for high-priority executions
const priorityWorker = new Worker(
  'priority-execution',
  async (job) => {
    logger.info(`Processing priority job: ${job.id}`);
    const { submissionId } = job.data;
    return await processSubmission(submissionId);
  },
  {
    ...workerConfig,
    concurrency: 5, // Fewer concurrent jobs for priority queue
  }
);

// Batch worker for handling multiple submissions
const batchWorker = new Worker(
  'batch-execution',
  async (job) => {
    const { submissionIds } = job.data;
    logger.info(`Processing batch of ${submissionIds.length} submissions`);

    const results = [];
    for (const submissionId of submissionIds) {
      try {
        const result = await processSubmission(submissionId);
        results.push(result);
      } catch (error) {
        logger.error(`Batch item failed: ${submissionId}`, error);
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        results.push({ submissionId, success: false, error: errorMessage });
      }
    }

    return { totalProcessed: results.length, results };
  },
  {
    ...workerConfig,
    concurrency: 3, // Lower concurrency for batch processing
  }
);

// Error handlers
submissionWorker.on('failed', (job, err) => {
  logger.error(`Submission job ${job?.id} failed:`, err);
});

priorityWorker.on('failed', (job, err) => {
  logger.error(`Priority job ${job?.id} failed:`, err);
});

batchWorker.on('failed', (job, err) => {
  logger.error(`Batch job ${job?.id} failed:`, err);
});

// Success handlers
submissionWorker.on('completed', (job) => {
  logger.info(`Submission job ${job.id} completed successfully`);
});

logger.info('👷 Enhanced workers running with high concurrency support...');
logger.info(
  `Workers configuration: concurrency=${workerConfig.concurrency}, removeOnComplete=${workerConfig.removeOnComplete}`
);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Shutting down workers gracefully...');
  await Promise.all([
    submissionWorker.close(),
    priorityWorker.close(),
    batchWorker.close(),
  ]);
  await executor.cleanup();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('Shutting down workers gracefully...');
  await Promise.all([
    submissionWorker.close(),
    priorityWorker.close(),
    batchWorker.close(),
  ]);
  await executor.cleanup();
  process.exit(0);
});
