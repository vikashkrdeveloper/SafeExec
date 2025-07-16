// src/config/env.ts
import { config as configDotenv } from 'dotenv';
configDotenv();

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/rce',
  redisUri: process.env.REDIS_URI || 'redis://localhost:6379',
};
