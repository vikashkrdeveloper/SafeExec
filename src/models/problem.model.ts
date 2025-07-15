// src/models/problem.model.ts
import { Schema, model } from 'mongoose';

const ProblemSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true, required: true },
    description: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'easy',
    },
    constraints: [String],
    allowedLanguages: [String],
    timeLimitMs: { type: Number, default: 2000 }, // 2 seconds
    memoryLimitMB: { type: Number, default: 256 }, // 256MB
  },
  { timestamps: true }
);

export const ProblemModel = model('Problem', ProblemSchema);
