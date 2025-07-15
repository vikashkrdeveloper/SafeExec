// src/routes/submission.routes.ts
import { Router } from 'express';
import {
  submitCode,
  getSubmission,
  getUserSubmissions,
  getExecutorStats,
} from '../controllers/submission.controller';
import {
  authenticateToken,
  checkSubmissionLimits,
} from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     SubmissionRequest:
 *       type: object
 *       required:
 *         - problemId
 *         - language
 *         - code
 *       properties:
 *         problemId:
 *           type: string
 *           description: ID of the problem to solve
 *           example: "507f1f77bcf86cd799439011"
 *         language:
 *           type: string
 *           enum: [python, javascript, java, cpp, c]
 *           description: Programming language for code execution
 *           example: "python"
 *         code:
 *           type: string
 *           description: Source code to execute (max 10,000 characters)
 *           example: "def solution(nums, target):\n    for i in range(len(nums)):\n        for j in range(i+1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]\n    return []"
 *
 *     SubmissionResponse:
 *       type: object
 *       properties:
 *         submissionId:
 *           type: string
 *           description: Unique submission identifier
 *           example: "507f1f77bcf86cd799439012"
 *         status:
 *           type: string
 *           enum: [pending, running, completed, failed, timeout]
 *           description: Current execution status
 *           example: "pending"
 *         result:
 *           type: object
 *           properties:
 *             output:
 *               type: string
 *               description: Program output
 *             error:
 *               type: string
 *               description: Error message if execution failed
 *             executionTime:
 *               type: number
 *               description: Execution time in milliseconds
 *             memoryUsage:
 *               type: number
 *               description: Memory usage in bytes
 *             testsPassed:
 *               type: number
 *               description: Number of test cases passed
 *             totalTests:
 *               type: number
 *               description: Total number of test cases
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Submission timestamp
 *
 *     ExecutorStats:
 *       type: object
 *       properties:
 *         totalSubmissions:
 *           type: number
 *           description: Total number of submissions processed
 *         activeExecutors:
 *           type: number
 *           description: Number of active executor containers
 *         queueLength:
 *           type: number
 *           description: Current queue length
 *         averageExecutionTime:
 *           type: number
 *           description: Average execution time in milliseconds
 *         supportedLanguages:
 *           type: array
 *           items:
 *             type: string
 *           description: List of supported programming languages
 */

/**
 * @swagger
 * /api/submit:
 *   post:
 *     summary: Submit code for execution
 *     description: Submit source code for a specific problem to be executed and evaluated. Requires authentication and is subject to rate limiting.
 *     tags:
 *       - Submissions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubmissionRequest'
 *     responses:
 *       200:
 *         description: Code submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubmissionResponse'
 *       400:
 *         description: Invalid request or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required fields: problemId, language, code"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Authentication required"
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Too many submissions. Please wait before submitting again."
 */
router.post('/', authenticateToken, checkSubmissionLimits, submitCode);

/**
 * @swagger
 * /api/submit/list:
 *   get:
 *     summary: Get user's submissions
 *     description: Retrieve a list of submissions for the authenticated user. Admins can query other users' submissions using the userId parameter.
 *     tags:
 *       - Submissions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Maximum number of submissions to return
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: User ID to query (admin only)
 *     responses:
 *       200:
 *         description: Successfully retrieved submissions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SubmissionResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Authentication required"
 */
router.get('/list', authenticateToken, getUserSubmissions);

/**
 * @swagger
 * /api/submit/stats:
 *   get:
 *     summary: Get executor system statistics
 *     description: Retrieve statistics about the code execution system including queue status, performance metrics, and supported languages. This is a public endpoint.
 *     tags:
 *       - Submissions
 *     responses:
 *       200:
 *         description: Successfully retrieved executor statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExecutorStats'
 *       500:
 *         description: Failed to retrieve statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to retrieve stats"
 */
router.get('/stats', getExecutorStats);

/**
 * @swagger
 * /api/submit/{submissionId}:
 *   get:
 *     summary: Get specific submission details
 *     description: Retrieve detailed information about a specific submission by its ID. Users can only access their own submissions unless they have admin privileges.
 *     tags:
 *       - Submissions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique submission identifier
 *         example: "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: Successfully retrieved submission details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubmissionResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Authentication required"
 *       403:
 *         description: Access denied - can only view own submissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Access denied"
 *       404:
 *         description: Submission not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to retrieve submission"
 */
router.get('/:submissionId', authenticateToken, getSubmission);

export default router;
