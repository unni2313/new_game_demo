import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';

/**
 * Middleware to protect routes - ensures user is logged in
 */
export const protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and check if it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    // 2) Verification token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    // The decoded token contains the 'id' we put there when signing
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
        return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
});

/**
 * Authorization middleware to restrict access to Admins only
 */
export const protectedForAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
};
