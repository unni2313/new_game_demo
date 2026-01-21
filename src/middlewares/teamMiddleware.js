import { body } from 'express-validator';
import { handleValidationErrors } from './userMiddleware.js';

/**
 * Validation rules for creating a team
 */
export const teamRules = [
    body('teamName')
        .trim()
        .notEmpty().withMessage('Team name is required')
        .isLength({ min: 3, max: 50 }).withMessage('Team name must be between 3 and 50 characters'),

    body('tagLine')
        .trim()
        .notEmpty().withMessage('Tag line is required')
        .isLength({ min: 5, max: 100 }).withMessage('Tag line must be between 5 and 100 characters'),
];

export { handleValidationErrors };
