import { Request, Response } from 'express';
import { SubmissionService } from '../services/submit.service';
import { logger } from '../utils/logger';

const submissionService = new SubmissionService();

export const submitCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { problemId, language, code } = req.body;
    const userId = req.user?.id;

    // Validate authentication
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Validate input
    if (!problemId || !language || !code) {
      res.status(400).json({
        error: 'Missing required fields: problemId, language, code',
      });
      return;
    }

    // Validate code length
    if (code.length > 10000) {
      res.status(400).json({
        error: 'Code too long. Maximum 10,000 characters allowed.',
      });
      return;
    }

    logger.info(
      `Received submission: user=${userId}, problem=${problemId}, language=${language}`
    );

    const result = await submissionService.submitCode(
      problemId,
      language,
      code,
      userId
    );

    res.json(result);
  } catch (error: unknown) {
    logger.error('Submit code error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Submission failed';
    res.status(400).json({ error: errorMessage });
  }
};

export const getSubmission = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { submissionId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const submission = (await submissionService.getSubmission(
      submissionId
    )) as {
      userId?: string;
      [key: string]: unknown;
    };

    // Only allow users to see their own submissions (unless admin)
    if (
      submission.userId &&
      submission.userId.toString() !== userId &&
      req.user?.role !== 'admin'
    ) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json(submission);
  } catch (error: unknown) {
    logger.error('Get submission error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to retrieve submission';
    res.status(404).json({ error: errorMessage });
  }
};

export const getUserSubmissions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Only allow users to see their own submissions (unless admin can query others)
    const targetUserId =
      req.user?.role === 'admin'
        ? (req.query.userId as string) || userId
        : userId;

    const submissions = await submissionService.getUserSubmissions(
      targetUserId,
      limit
    );

    res.json(submissions);
  } catch (error: unknown) {
    logger.error('Get user submissions error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to retrieve submissions';
    res.status(400).json({ error: errorMessage });
  }
};

export const getExecutorStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const stats = await submissionService.getExecutorStats();
    res.json(stats);
  } catch (error: unknown) {
    logger.error('Get executor stats error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to retrieve stats';
    res.status(500).json({ error: errorMessage });
  }
};
