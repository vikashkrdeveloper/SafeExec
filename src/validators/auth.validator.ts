const { body } = require('express-validator');
import { VALIDATION_RULES } from '../constants';

export const registerValidator = [
  body('username')
    .isLength({
      min: VALIDATION_RULES.USERNAME_MIN_LENGTH,
      max: VALIDATION_RULES.USERNAME_MAX_LENGTH,
    })
    .withMessage(
      `Username must be between ${VALIDATION_RULES.USERNAME_MIN_LENGTH} and ${VALIDATION_RULES.USERNAME_MAX_LENGTH} characters`
    )
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),

  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .isLength({ min: VALIDATION_RULES.PASSWORD_MIN_LENGTH })
    .withMessage(
      `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters long`
    )
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    ),
];

export const loginValidator = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password').notEmpty().withMessage('Password is required'),
];

export const changePasswordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: VALIDATION_RULES.PASSWORD_MIN_LENGTH })
    .withMessage(
      `New password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters long`
    )
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'New password must contain at least one lowercase letter, one uppercase letter, and one number'
    ),

  body('confirmPassword').custom(
    (value: string, { req }: { req: { body: { newPassword: string } } }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }
  ),
];
