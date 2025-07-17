// src/queue/worker.ts
import { Worker, WorkerOptions } from 'bullmq';
import { environmentConfig } from '../config/environment';
import { SubmissionModel } from '../models/submission.model';
import { SecureDockerExecutor } from '../executors/secureDockerExecutor';
import { getPerformanceMonitor } from '../services/performanceMonitor';
import { logger } from '../utils/logger';

const config = environmentConfig.getConfig();

// Enhanced error type for job processing
interface ProcessingError extends Error {
  shouldRetry?: boolean;
}

// Initialize the secure executor and performance monitor
const executor = new SecureDockerExecutor();
const performanceMonitor = getPerformanceMonitor(executor);

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
    // Connection pooling for better performance
    db: 0,
    keepAlive: 30000,
  },
  concurrency: parseInt(process.env.WORKER_CONCURRENCY || '20'), // Increased from 10
  removeOnComplete: { count: 100 },
  removeOnFail: { count: 50 },
  maxStalledCount: 1, // Reduce stalled job retries
  stalledInterval: 30000, // Check for stalled jobs every 30s
};

// Processing function that can be reused
const processSubmission = async (submissionId: string) => {
  logger.info(`Processing submission: ${submissionId}`);
  const startTime = Date.now();

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

    // Record execution metrics for performance monitoring
    const executionTime = Date.now() - startTime;
    performanceMonitor.recordExecution(result.success, executionTime);

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
    const executionTime = Date.now() - startTime;
    performanceMonitor.recordExecution(false, executionTime);

    logger.error(`Failed to process submission ${submissionId}:`, error);

    // Enhanced error handling for different error types
    let errorMessage = 'Unknown error';
    let shouldRetry = true;

    if (error instanceof Error) {
      errorMessage = error.message;

      // Don't retry certain types of errors
      if (
        error.message.includes('Concurrent execution limit reached') ||
        error.message.includes('Docker') ||
        error.message.includes('timeout')
      ) {
        shouldRetry = false;
      }
    }

    try {
      const submission = await SubmissionModel.findById(submissionId);
      if (submission) {
        submission.status = 'failed';
        if (!submission.result) {
          submission.result = {
            success: false,
            output: '',
            error: errorMessage,
            executionTime: executionTime,
            memoryUsed: 0,
            testCasesPassed: 0,
            totalTestCases: 0,
          };
        } else {
          submission.result.error = errorMessage;
          submission.result.executionTime = executionTime;
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
      }
    } catch (updateError) {
      logger.error(
        `Failed to update submission ${submissionId} with error:`,
        updateError
      );
    }

    // Throw with retry flag for job queue handling
    const enhancedError = new Error(errorMessage) as ProcessingError;
    enhancedError.shouldRetry = shouldRetry;
    throw enhancedError;
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

    // Define proper return type for results
    const results: Array<{
      submissionId: string;
      success: boolean;
      error?: string;
    }> = [];

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

// Error handlers with circuit breaker logic
let consecutiveFailures = 0;
const MAX_CONSECUTIVE_FAILURES = 10;
let circuitBreakerOpen = false;

submissionWorker.on('failed', async (job, err) => {
  consecutiveFailures++;
  logger.error(`Submission job ${job?.id} failed:`, err);

  // Open circuit breaker if too many failures
  if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES && !circuitBreakerOpen) {
    circuitBreakerOpen = true;
    logger.error(
      `Circuit breaker opened due to ${consecutiveFailures} consecutive failures`
    );

    // Pause worker for 30 seconds
    await submissionWorker.pause();
    setTimeout(async () => {
      try {
        await submissionWorker.resume();
        consecutiveFailures = 0;
        circuitBreakerOpen = false;
        logger.info('Circuit breaker closed, resuming operations');
      } catch (error) {
        logger.error('Failed to resume worker:', error);
      }
    }, 30000);
  }
});

submissionWorker.on('completed', (job) => {
  consecutiveFailures = 0; // Reset failure count on success
  logger.info(`Submission job ${job.id} completed successfully`);
});

priorityWorker.on('failed', (job, err) => {
  logger.error(`Priority job ${job?.id} failed:`, err);
});

batchWorker.on('failed', (job, err) => {
  logger.error(`Batch job ${job?.id} failed:`, err);
});

// Success handlers
priorityWorker.on('completed', (job) => {
  logger.info(`Priority job ${job.id} completed successfully`);
});

batchWorker.on('completed', (job) => {
  logger.info(`Batch job ${job.id} completed successfully`);
});

// Health monitoring and load management
setInterval(async () => {
  try {
    const health = await performanceMonitor.getHealthStatus();

    if (health.status === 'critical') {
      logger.warn('System under critical load - monitoring worker performance');

      // Log current metrics for debugging
      const metrics = performanceMonitor.getMetrics();
      logger.warn('Current metrics:', {
        totalExecutions: metrics.totalExecutions,
        successRate: metrics.successRate,
        currentLoad: metrics.currentLoad,
        containerCount: metrics.containerCount,
      });
    }
  } catch (error) {
    logger.error('Health check failed in worker:', error);
  }
}, 60000); // Check every minute

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
