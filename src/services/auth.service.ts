import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserModel } from '../models/user.model';
import { logger } from '../utils/logger';

const JWT_SECRET =
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

export class AuthService {
  // Generate JWT token
  static generateToken(user: AuthUser): string {
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, JWT_SECRET as string, { expiresIn: '24h' });
  }

  // Verify JWT token
  static verifyToken(token: string): AuthUser | null {
    try {
      const decoded = jwt.verify(
        token,
        JWT_SECRET as string
      ) as jwt.JwtPayload & {
        id: string;
        username: string;
        email: string;
        role: string;
      };
      return {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role,
      };
    } catch (error) {
      logger.error('Token verification failed:', error);
      return null;
    }
  }

  // Hash password
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  // Compare password
  static async comparePassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Register new user
  static async register(userData: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<{ user: AuthUser; token: string }> {
    const { username, email, password, firstName, lastName } = userData;

    // Check if user already exists
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Create user
    const user = await UserModel.create({
      username,
      email,
      passwordHash,
      profile: {
        firstName: firstName || '',
        lastName: lastName || '',
      },
      stats: {
        totalSubmissions: 0,
        successfulSubmissions: 0,
        lastActive: new Date(),
      },
    });

    const authUser: AuthUser = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const token = this.generateToken(authUser);

    logger.info(`New user registered: ${username} (${email})`);

    return { user: authUser, token };
  }

  // Login user
  static async login(
    email: string,
    password: string
  ): Promise<{ user: AuthUser; token: string }> {
    // Find user
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await this.comparePassword(
      password,
      user.passwordHash
    );
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Update last active
    if (user.stats) {
      user.stats.lastActive = new Date();
      await user.save();
    }

    const authUser: AuthUser = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const token = this.generateToken(authUser);

    logger.info(`User logged in: ${user.username} (${user.email})`);

    return { user: authUser, token };
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<AuthUser | null> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) return null;

      return {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
      };
    } catch (error) {
      logger.error('Error fetching user:', error);
      return null;
    }
  }

  // Check user submission limits
  static async checkSubmissionLimits(userId: string): Promise<boolean> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) return false;

      // Check hourly submission limit
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const { SubmissionModel } = await import('../models/submission.model');

      const recentSubmissions = await SubmissionModel.countDocuments({
        userId,
        'timing.submittedAt': { $gte: oneHourAgo },
      });

      return recentSubmissions < (user.limits?.maxSubmissionsPerHour || 100);
    } catch (error) {
      logger.error('Error checking submission limits:', error);
      return false;
    }
  }

  // Update user stats after submission
  static async updateUserStats(
    userId: string,
    success: boolean
  ): Promise<void> {
    try {
      const updateQuery: {
        $inc: Record<string, number>;
        $set: Record<string, Date>;
      } = {
        $inc: { 'stats.totalSubmissions': 1 },
        $set: { 'stats.lastActive': new Date() },
      };

      if (success) {
        updateQuery.$inc['stats.successfulSubmissions'] = 1;
      }

      await UserModel.findByIdAndUpdate(userId, updateQuery);
    } catch (error) {
      logger.error('Error updating user stats:', error);
    }
  }
}
