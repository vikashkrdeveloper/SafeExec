// src/queue/worker.ts
import { Worker } from 'bullmq';
import { environmentConfig } from '../config/environment';
import { SubmissionModel } from '../models/submission.model';
import { executeInDocker } from '../executors/dockerExecutor';

const config = environmentConfig.getConfig();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const worker = new Worker(
  'submission',
  async (job) => {
    const { submissionId } = job.data;
    const submission = await SubmissionModel.findById(submissionId);
    if (!submission) throw new Error('Submission not found');

    // Convert submission to the expected interface
    const submissionData = {
      _id: submission._id.toString(),
      code: submission.code,
      language: submission.language,
      timeLimitMs: config.executor.timeoutMs,
      save: async () => {
        await submission.save();
      },
    };

    await executeInDocker(submissionData);
  },
  {
    connection: {
      host: config.redis.uri.includes('://')
        ? new URL(config.redis.uri).hostname
        : config.redis.uri.split(':')[0],
      port: config.redis.uri.includes('://')
        ? parseInt(new URL(config.redis.uri).port) || 6379
        : parseInt(config.redis.uri.split(':')[1]) || 6379,
      ...(config.redis.password && { password: config.redis.password }),
    },
  }
);

console.log('👷 Worker running...');
