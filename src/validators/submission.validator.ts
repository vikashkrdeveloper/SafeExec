const { body, param } = require('express-validator');
import { LANGUAGES, VALIDATION_RULES } from '../constants';

export const submitCodeValidator = [
  body('problemId').isMongoId().withMessage('Invalid problem ID'),

  body('language')
    .isIn(Object.values(LANGUAGES))
    .withMessage(
      `Language must be one of: ${Object.values(LANGUAGES).join(', ')}`
    ),

  body('code')
    .trim()
    .notEmpty()
    .withMessage('Code is required')
    .isLength({ max: VALIDATION_RULES.CODE_MAX_LENGTH })
    .withMessage(
      `Code must not exceed ${VALIDATION_RULES.CODE_MAX_LENGTH} characters`
    ),
];

export const getSubmissionValidator = [
  param('id').isMongoId().withMessage('Invalid submission ID'),
];

export const executeCodeValidator = [
  body('language')
    .isIn(Object.values(LANGUAGES))
    .withMessage(
      `Language must be one of: ${Object.values(LANGUAGES).join(', ')}`
    ),

  body('code')
    .trim()
    .notEmpty()
    .withMessage('Code is required')
    .isLength({ max: VALIDATION_RULES.CODE_MAX_LENGTH })
    .withMessage(
      `Code must not exceed ${VALIDATION_RULES.CODE_MAX_LENGTH} characters`
    ),

  body('input').optional().isString().withMessage('Input must be a string'),
];
