const { body, param } = require('express-validator');

export const createProblemValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Problem title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Problem description is required')
    .isLength({ min: 50 })
    .withMessage('Description must be at least 50 characters'),

  body('difficulty')
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard'),

  body('tags')
    .isArray({ min: 1 })
    .withMessage('At least one tag is required')
    .custom((tags: string[]) => {
      if (
        !tags.every((tag) => typeof tag === 'string' && tag.trim().length > 0)
      ) {
        throw new Error('All tags must be non-empty strings');
      }
      return true;
    }),

  body('testCases')
    .isArray({ min: 1 })
    .withMessage('At least one test case is required')
    .custom((testCases: { input: string; expectedOutput: string }[]) => {
      if (!testCases.every((tc) => tc.input && tc.expectedOutput)) {
        throw new Error('Each test case must have input and expectedOutput');
      }
      return true;
    }),

  body('constraints')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Constraints must not exceed 1000 characters'),
];

export const updateProblemValidator = [
  param('id').isMongoId().withMessage('Invalid problem ID'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 50 })
    .withMessage('Description must be at least 50 characters'),

  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard'),

  body('tags')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one tag is required if provided'),

  body('testCases')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one test case is required if provided'),
];

export const problemIdValidator = [
  param('id').isMongoId().withMessage('Invalid problem ID'),
];
