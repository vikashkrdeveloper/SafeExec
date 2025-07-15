const { query, param } = require('express-validator');

export const paginationValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),

  query('sort').optional().isString().trim(),

  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc'),
];

export const mongoIdValidator = [
  param('id').isMongoId().withMessage('Invalid ID format'),
];

export const searchValidator = [
  query('q')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
];

export const filterValidator = [
  query('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard'),

  query('tags')
    .optional()
    .custom((value: unknown) => {
      if (typeof value === 'string') {
        return true; // Single tag
      }
      if (Array.isArray(value)) {
        return value.every((tag: unknown) => typeof tag === 'string');
      }
      return false;
    })
    .withMessage('Tags must be a string or array of strings'),
];
