// src/controllers/problem.controller.ts
import { Request, Response } from 'express';
import { ProblemModel } from '../models/problem.model';

export const getProblems = async (_: Request, res: Response) => {
  try {
    console.log(
      '📋 Getting problems from collection:',
      ProblemModel.collection.name
    );
    const problems = await ProblemModel.find().select('-__v');
    console.log('🔍 Found problems:', problems.length);
    console.log('📄 Problems data:', JSON.stringify(problems, null, 2));
    res.json(problems);
  } catch (error) {
    console.error('❌ Error getting problems:', error);
    res.status(500).json({ error: 'Failed to get problems' });
  }
};
