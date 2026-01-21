import { body } from 'express-validator';
import { handleValidationErrors } from './userMiddleware.js';

import { Team } from '../models/teamModel.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';

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

/**
 * Middleware to check if a team exists before a user joins it
 */
export const checkTeamExists = catchAsync(async (req, res, next) => {
    const teamName = req.body.teamName;

    if (!teamName) {
        return next(new AppError('Please provide a team name', 400));
    }

    const team = await Team.findByName(teamName);

    if (!team) {
        return next(new AppError('No team found with that name', 404));
    }

    next();
});

export { handleValidationErrors };
