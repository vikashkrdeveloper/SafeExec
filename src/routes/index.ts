// src/routes/index.ts
import { Router } from 'express';
import problemRoutes from './problem.routes';
import submissionRoutes from './submission.routes';
import authRoutes from './auth.routes';
import executeRoutes from './execute.routes';
import healthRoutes from './health.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/problems', problemRoutes);
router.use('/submit', submissionRoutes);
router.use('/execute', executeRoutes);
router.use('/health', healthRoutes);

export default router;
