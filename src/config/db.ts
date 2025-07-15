// src/config/db.ts
import mongoose from 'mongoose';
import { config } from './env';

export const connectDB = async () => {
  await mongoose.connect(config.mongoUri);
  console.log('✅ MongoDB connected');
};
