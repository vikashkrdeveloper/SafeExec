// src/queue/queue.ts
import { Queue } from 'bullmq';
import { environmentConfig } from '../config/environment';

const config = environmentConfig.getConfig();

export const submissionQueue = new Queue('submission', {
  connection: {
    host: config.redis.uri.includes('://')
      ? new URL(config.redis.uri).hostname
      : config.redis.uri.split(':')[0],
    port: config.redis.uri.includes('://')
      ? parseInt(new URL(config.redis.uri).port) || 6379
      : parseInt(config.redis.uri.split(':')[1]) || 6379,
    ...(config.redis.password && { password: config.redis.password }),
  },
});
