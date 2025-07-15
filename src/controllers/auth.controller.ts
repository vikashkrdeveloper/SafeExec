import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { logger } from '../utils/logger';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Input validation
    if (!username || !email || !password) {
      res.status(400).json({
        error: 'Username, email, and password are required',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        error: 'Password must be at least 6 characters long',
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        error: 'Invalid email format',
      });
      return;
    }

    // Username validation
    if (username.length < 3 || username.length > 30) {
      res.status(400).json({
        error: 'Username must be between 3 and 30 characters',
      });
      return;
    }

    const result = await AuthService.register({
      username,
      email,
      password,
      firstName,
      lastName,
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: result.user,
      token: result.token,
    });
  } catch (error: unknown) {
    logger.error('Registration error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Registration failed';
    res.status(400).json({ error: errorMessage });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        error: 'Email and password are required',
      });
      return;
    }

    const result = await AuthService.login(email, password);

    res.json({
      message: 'Login successful',
      user: result.user,
      token: result.token,
    });
  } catch (error: unknown) {
    logger.error('Login error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Login failed';
    res.status(401).json({ error: errorMessage });
  }
};

export const getProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const user = await AuthService.getUserById(req.user.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error: unknown) {
    logger.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const newToken = AuthService.generateToken(req.user);

    res.json({
      message: 'Token refreshed successfully',
      token: newToken,
    });
  } catch (error: unknown) {
    logger.error('Token refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // In a real implementation, you might want to blacklist the token
    // For now, we'll just return a success message
    res.json({ message: 'Logout successful' });
  } catch (error: unknown) {
    logger.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};
