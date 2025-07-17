// src/queue/queue.ts
import { Queue, QueueOptions } from 'bullmq';
import { environmentConfig } from '../config/environment';

const config = environmentConfig.getConfig();

// Enhanced queue configuration for high throughput
const queueConfig: QueueOptions = {
  connection: {
    host: config.redis.uri.includes('://')
      ? new URL(config.redis.uri).hostname
      : config.redis.uri.split(':')[0],
    port: config.redis.uri.includes('://')
      ? parseInt(new URL(config.redis.uri).port) || 6379
      : parseInt(config.redis.uri.split(':')[1]) || 6379,
    ...(config.redis.password && { password: config.redis.password }),
    // Optimized Redis connection settings for high load
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    lazyConnect: true,
    // Connection pool settings
    family: 4, // IPv4
    connectTimeout: 10000,
    commandTimeout: 5000,
  },
  defaultJobOptions: {
    removeOnComplete: 100, // Keep last 100 successful jobs
    removeOnFail: 50, // Keep last 50 failed jobs
    attempts: 3, // Retry failed jobs up to 3 times
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
};

export const submissionQueue = new Queue('submission', queueConfig);

// Enhanced priority queue for urgent executions
export const priorityQueue = new Queue('priority-execution', {
  ...queueConfig,
  defaultJobOptions: {
    ...queueConfig.defaultJobOptions,
    priority: 10, // Higher priority
    removeOnComplete: 50,
    removeOnFail: 25,
  },
});

// Batch processing queue for handling multiple submissions efficiently
export const batchQueue = new Queue('batch-execution', {
  ...queueConfig,
  defaultJobOptions: {
    ...queueConfig.defaultJobOptions,
    removeOnComplete: 200,
    removeOnFail: 100,
  },
});
