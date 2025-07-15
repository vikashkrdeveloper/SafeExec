import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  refreshToken,
  logout,
} from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user account
 *     description: Create a new user account with username, email, and password. Username must be unique and alphanumeric with underscores only.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           examples:
 *             example1:
 *               summary: Example registration
 *               value:
 *                 username: "john_doe"
 *                 email: "john@example.com"
 *                 password: "securePassword123"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             examples:
 *               success:
 *                 summary: Successful registration
 *                 value:
 *                   success: true
 *                   message: "User registered successfully"
 *                   data:
 *                     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     user:
 *                       _id: "60d21b4667d0d8992e610c85"
 *                       username: "john_doe"
 *                       email: "john@example.com"
 *                       role: "user"
 *                       createdAt: "2023-01-01T12:00:00Z"
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: Validation error
 *                 value:
 *                   success: false
 *                   error: "Username must be alphanumeric with underscores only"
 *               user_exists:
 *                 summary: User already exists
 *                 value:
 *                   success: false
 *                   error: "User with this email already exists"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login to user account
 *     description: Authenticate user with email and password to receive JWT access token for API access.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             example1:
 *               summary: Example login
 *               value:
 *                 email: "john@example.com"
 *                 password: "securePassword123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             examples:
 *               success:
 *                 summary: Successful login
 *                 value:
 *                   success: true
 *                   message: "Login successful"
 *                   data:
 *                     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     user:
 *                       _id: "60d21b4667d0d8992e610c85"
 *                       username: "john_doe"
 *                       email: "john@example.com"
 *                       role: "user"
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_credentials:
 *                 summary: Invalid credentials
 *                 value:
 *                   success: false
 *                   error: "Invalid email or password"
 *       429:
 *         description: Too many login attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               rate_limit:
 *                 summary: Rate limit exceeded
 *                 value:
 *                   success: false
 *                   error: "Too many authentication attempts, please try again later."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Generate a new access token using a valid refresh token. This endpoint is used to maintain user sessions without requiring re-login.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Valid refresh token
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Token refreshed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: New access token
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/refresh', refreshToken);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile information
 *     description: Retrieve detailed information about the authenticated user's profile including account settings and statistics.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/User'
 *                     - type: object
 *                       properties:
 *                         stats:
 *                           type: object
 *                           properties:
 *                             totalSubmissions:
 *                               type: integer
 *                               description: Total number of code submissions
 *                               example: 25
 *                             acceptedSubmissions:
 *                               type: integer
 *                               description: Number of accepted submissions
 *                               example: 18
 *                             problemsSolved:
 *                               type: integer
 *                               description: Number of unique problems solved
 *                               example: 15
 *             examples:
 *               user_profile:
 *                 summary: User profile with statistics
 *                 value:
 *                   success: true
 *                   data:
 *                     _id: "60d21b4667d0d8992e610c85"
 *                     username: "john_doe"
 *                     email: "john@example.com"
 *                     role: "user"
 *                     createdAt: "2023-01-01T12:00:00Z"
 *                     stats:
 *                       totalSubmissions: 25
 *                       acceptedSubmissions: 18
 *                       problemsSolved: 15
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               no_token:
 *                 summary: No token provided
 *                 value:
 *                   success: false
 *                   error: "Authentication required"
 *               invalid_token:
 *                 summary: Invalid token
 *                 value:
 *                   success: false
 *                   error: "Invalid token"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/profile', authenticateToken, getProfile);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Invalidate the current user session and token. This ensures the access token cannot be used for future requests.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logout successful"
 *             examples:
 *               success:
 *                 summary: Successful logout
 *                 value:
 *                   success: true
 *                   message: "Logout successful"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/logout', authenticateToken, logout);

export default router;
