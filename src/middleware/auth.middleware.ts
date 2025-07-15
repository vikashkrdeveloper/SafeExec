import { Request, Response, NextFunction } from 'express';
import { AuthService, AuthUser } from '../services/auth.service';
import { logger } from '../utils/logger';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const user = AuthService.verifyToken(token);
    if (!user) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }

    // Verify user still exists in database
    const dbUser = await AuthService.getUserById(user.id);
    if (!dbUser) {
      res.status(403).json({ error: 'User not found' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

export const checkSubmissionLimits = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const canSubmit = await AuthService.checkSubmissionLimits(req.user.id);
    if (!canSubmit) {
      res.status(429).json({
        error: 'Submission limit exceeded. Please try again later.',
      });
      return;
    }

    next();
  } catch (error) {
    logger.error('Error checking submission limits:', error);
    res.status(500).json({ error: 'Failed to check submission limits' });
  }
};

export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const user = AuthService.verifyToken(token);
    if (user) {
      req.user = user;
    }
  }

  next();
};
