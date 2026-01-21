import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../models/userModel.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

/**
 * Register a new user
 * POST /api/users/register
 */
export const registerUser = catchAsync(async (req, res, next) => {
    const { name, email, age, password, role } = req.body;

    const result = await User.create({
        name,
        email,
        age: Number(age),
        password, // already hashed by middleware
        role
    });

    const token = signToken(result.insertedId);

    // Send response (without password)
    res.status(201).json({
        status: 'success',
        token,
        message: 'User registered successfully',
        data: {
            userId: result.insertedId,
            name,
            email,
            age: Number(age),
            role: role || 'user'
        }
    });
});

/**
 * Login user
 * POST /api/users/login
 */
export const loginUser = catchAsync(async (req, res, next) => {
    const { password } = req.body;
    const user = req.user;

    // 1) Check if password is correct
    if (!(await bcrypt.compare(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    // 2) If everything ok, send token to client
    const token = signToken(user._id);

    res.status(200).json({
        status: 'success',
        token,
        data: {
            userId: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
});

/**
 * Get user profile
 * GET /api/users/profile
 */
export const getProfile = catchAsync(async (req, res, next) => {
    // The user is already attached to the request by the 'protect' middleware
    const user = req.user;

    res.status(200).json({
        status: 'success',
        data: {
            userId: user._id,
            name: user.name,
            email: user.email,
            age: user.age,
            role: user.role,
            createdAt: user.createdAt
        }
    });
});

/**
 * Logout user
 * POST /api/users/logout
 */
export const logoutUser = (req, res) => {
    // Note: Since we use JWT (stateless), 
    // real "logout" happens on the client by deleting the token.
    res.status(200).json({
        status: 'success',
        message: 'Logged out successfully! Please delete your token on the client side.'
    });
};

