// src/queue/queue.ts
import { Queue } from 'bullmq';
import { config } from '../config/env';

export const submissionQueue = new Queue('submission', {
  connection: {
    host: config.redisHost,
    port: config.redisPort,
  },
});
