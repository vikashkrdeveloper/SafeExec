// src/models/testcase.model.ts
import { Schema, model, Types } from 'mongoose';
const TestCaseSchema = new Schema(
  {
    problemId: { type: Types.ObjectId, ref: 'Problem', required: true },
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isSample: { type: Boolean, default: false },
    hidden: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const TestCaseModel = model('TestCase', TestCaseSchema);
