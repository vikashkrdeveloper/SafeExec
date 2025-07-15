// src/models/submission.model.ts
import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true,
    index: true,
  },
  language: {
    type: String,
    required: true,
    enum: [
      'python',
      'javascript',
      'nodejs',
      'java',
      'cpp',
      'c',
      'go',
      'golang',
    ],
  },
  code: {
    type: String,
    required: true,
    maxlength: 50000,
  },
  status: {
    type: String,
    enum: [
      'pending',
      'running',
      'completed',
      'failed',
      'timeout',
      'memory_exceeded',
    ],
    default: 'pending',
    index: true,
  },
  result: {
    success: { type: Boolean, default: false },
    output: { type: String, default: '' },
    error: { type: String, default: '' },
    executionTime: { type: Number, default: 0 }, // in milliseconds
    memoryUsed: { type: Number, default: 0 }, // in MB
    testCasesPassed: { type: Number, default: 0 },
    totalTestCases: { type: Number, default: 0 },
  },
  security: {
    containerId: String,
    ipAddress: String,
    userAgent: String,
    executionNode: String,
  },
  timing: {
    submittedAt: { type: Date, default: Date.now },
    startedAt: Date,
    completedAt: Date,
    queueTime: Number, // time spent in queue
    executionTime: Number, // actual execution time
  },
  metadata: {
    codeHash: String, // for duplicate detection
    sourceLines: Number,
    complexity: String, // basic complexity analysis
  },
});

submissionSchema.index({ userId: 1, 'timing.submittedAt': -1 });
submissionSchema.index({ problemId: 1, status: 1 });
submissionSchema.index({ status: 1, 'timing.submittedAt': 1 });

export const SubmissionModel = mongoose.model('Submission', submissionSchema);
