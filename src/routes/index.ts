// src/routes/index.ts
import { Router } from 'express';
import problemRoutes from './problem.routes';
import submissionRoutes from './submission.routes';
import authRoutes from './auth.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/problems', problemRoutes);
router.use('/submit', submissionRoutes);

export default router;
