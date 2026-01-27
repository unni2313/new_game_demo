import { body } from 'express-validator';
import { handleValidationErrors } from './userMiddleware.js';

/**
 * Validation rules for starting a game
 */
export const startGameRules = [
    body('difficultyLevel')
        .notEmpty().withMessage('difficultyLevel is required')
        .isIn(['easy', 'medium', 'hard']).withMessage('difficultyLevel must be easy, medium, or hard'),

    body('no_of_overs')
        .notEmpty().withMessage('no_of_overs is required')
        .isInt({ min: 1, max: 50 }).withMessage('no_of_overs must be between 1 and 50'),

    body('totalRunsNeeded')
        .notEmpty().withMessage('totalRunsNeeded is required')
        .isInt({ min: 1, max: 1000 }).withMessage('totalRunsNeeded must be between 1 and 1000'),
];

/**
 * Validation rules for updating game score
 */
export const updateScoreRules = [
    body('matchId')
        .notEmpty().withMessage('matchId is required'),

    body('runs')
        .notEmpty().withMessage('runs is required')
        .isInt({ min: 0, max: 6 }).withMessage('runs must be between 0 and 6'),

    body('wicket')
        .notEmpty().withMessage('wicket is required')
        .isBoolean().withMessage('wicket must be a boolean value'),

    body('angle')
        .optional()
        .isNumeric().withMessage('angle must be a number'),
];

import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { getDB } from '../config/db.js';

/**
 * Middleware to check if the user has joined a valid team
 * Assumes 'protect' middleware has already run and populated req.user
 */
export const checkUserTeamMembership = catchAsync(async (req, res, next) => {
    // 1. Check if user object has a team field
    if (!req.user || !req.user.team) {
        return next(new AppError('You must join a team before starting a game.', 403));
    }

    // 2. Verify that the team actually exists in the database
    const db = getDB();
    const teamDoc = await db.collection('teams').findOne({ teamName: req.user.team });

    if (!teamDoc) {
        return next(new AppError(`The team '${req.user.team}' you are currently associated with does not exist. Please join a valid team.`, 404));
    }

    // 3. Attach the verified teamId to the request for the controller to use
    req.teamId = teamDoc._id;

    next();
});

export { handleValidationErrors };
