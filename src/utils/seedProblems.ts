// src/utils/seedProblems.ts
import { connectDB } from '../config/db';
import { ProblemModel } from '../models/problem.model';

(async () => {
  await connectDB();

  // Clear existing problems first
  await ProblemModel.deleteMany({});
  console.log('🧹 Cleared existing problems');

  await ProblemModel.create({
    title: 'Sum of Two Numbers',
    slug: 'sum-two',
    description: 'Add two integers.',
    difficulty: 'easy',
    allowedLanguages: ['python'],
    constraints: ['1 <= a, b <= 1000'],
    timeLimitMs: 2000,
    memoryLimitMB: 128,
  });

  console.log('🔥 Seeded problem!');
  process.exit(0);
})();
