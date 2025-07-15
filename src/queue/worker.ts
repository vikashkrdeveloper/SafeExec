// src/queue/worker.ts
import { Worker } from 'bullmq';
import { config } from '../config/env';
import { SubmissionModel } from '../models/submission.model';
import { executeInDocker } from '../executors/dockerExecutor';

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
      timeLimitMs: 10000,
      save: async () => {
        await submission.save();
      },
    };

    await executeInDocker(submissionData);
  },
  {
    connection: {
      host: config.redisHost,
      port: config.redisPort,
    },
  }
);

console.log('👷 Worker running...');
