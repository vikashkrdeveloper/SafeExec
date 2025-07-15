// src/routes/problem.routes.ts
import { Router } from 'express';
import { getProblems } from '../controllers/problem.controller';

const router = Router();

/**
 * @swagger
 * /api/problems:
 *   get:
 *     summary: Get all available problems
 *     description: Retrieve a list of all coding problems available in the system. This endpoint is public and doesn't require authentication.
 *     tags:
 *       - Problems
 *     responses:
 *       200:
 *         description: Successfully retrieved problems
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Unique problem identifier
 *                     example: "507f1f77bcf86cd799439011"
 *                   title:
 *                     type: string
 *                     description: Problem title
 *                     example: "Two Sum"
 *                   description:
 *                     type: string
 *                     description: Problem description and requirements
 *                     example: "Given an array of integers, return indices of the two numbers such that they add up to a specific target."
 *                   difficulty:
 *                     type: string
 *                     enum: [Easy, Medium, Hard]
 *                     description: Problem difficulty level
 *                     example: "Easy"
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Problem category tags
 *                     example: ["Array", "Hash Table"]
 *                   constraints:
 *                     type: string
 *                     description: Problem constraints
 *                     example: "2 <= nums.length <= 10^4"
 *                   examples:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         input:
 *                           type: string
 *                           description: Example input
 *                         output:
 *                           type: string
 *                           description: Expected output
 *                         explanation:
 *                           type: string
 *                           description: Explanation of the example
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to get problems"
 */
router.get('/', getProblems);

export default router;
