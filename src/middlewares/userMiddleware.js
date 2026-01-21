import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { User } from '../models/userModel.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';

/**
 * Validation rules for user registration
 */
export const registrationRules = [
    body('name')
        .trim()
        .escape()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),

    body('age')
        .notEmpty().withMessage('Age is required')
        .isInt({ min: 1, max: 120 }).withMessage('Age must be a number between 1 and 120'),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

/**
 * Middleware to restrict role parameter in the request body
 * (Prevents users from registering as admins)
 */
export const restrictRoleParameter = (req, res, next) => {
    if (req.body.role) {
        return next(new AppError('You are not allowed to set the user role manually. Registration is for regular users only.', 403));
    }
    next();
};

/**
 * Validation rules for user login
 */
export const loginRules = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address'),

    body('password')
        .notEmpty().withMessage('Password is required')
];

/**
 * Middleware to handle validation errors from express-validator
 */
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const firstError = errors.array()[0].msg;
        return next(new AppError(firstError, 400));
    }
    next();
};

/**
 * Middleware to check if a user with the given email already exists
 */
export const checkDuplicateEmail = catchAsync(async (req, res, next) => {
    const existingUser = await User.findByEmail(req.body.email);

    if (existingUser) {
        return next(new AppError('User with this email already exists', 400));
    }

    next();
});

/**
 * Middleware to find user by email and attach to request
 */
export const findUser = catchAsync(async (req, res, next) => {
    const user = await User.findByEmail(req.body.email);

    if (!user) {
        return next(new AppError('Incorrect email or password', 401));
    }

    req.user = user;
    next();
});

/**
 * Middleware to hash the user's password before saving
 */
export const hashPassword = catchAsync(async (req, res, next) => {
    const saltRounds = 12;
    req.body.password = await bcrypt.hash(req.body.password, saltRounds);
    next();
});
