import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';

const signToken = (id) => {
    const strId = id && id.toString ? id.toString() : id;
    return jwt.sign({ id: strId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

/**
 * Register a new user
 * POST /api/users/register
 */
export const registerUser = catchAsync(async (req, res, next) => {
    const { name, email, age, password, role } = req.body;

    const db = getDB();
    const result = await db.collection('users').insertOne({
        name,
        email,
        age: Number(age),
        password, // already hashed by middleware
        role,
        createdAt: new Date()
    });

    const token = signToken(result.insertedId);

    // Send response (without password)
    res.sendSuccess(201, 'User registered successfully', {
        userId: result.insertedId,
        token,
        name,
        email,
        age: Number(age),
        role: role || 'user'
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

    res.sendSuccess(200, 'Logged in successfully', {
        userId: user._id,
        token,
        name: user.name,
        email: user.email,
        role: user.role
    });
});

/**
 * Get user profile
 * GET /api/users/profile
 */
export const getProfile = catchAsync(async (req, res, next) => {
    // The user is already attached to the request by the 'protect' middleware
    const user = req.user;

    res.sendSuccess(200, 'User profile retrieved', {
        userId: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        role: user.role,
        team: user.team || 'No team joined yet',
        createdAt: user.createdAt
    });
});

/**
 * Logout user
 * POST /api/users/logout
 */
export const logoutUser = (req, res) => {
    // Note: Since we use JWT (stateless), 
    // real "logout" happens on the client by deleting the token.
    res.sendSuccess(200, 'Logged out successfully! Please delete your token on the client side.');
};

/**
 * Join a team
 * PATCH /api/users/join-team
 */
export const joinTeam = catchAsync(async (req, res, next) => {
    const { teamName } = req.body;
    const userId = req.user._id;

    const db = getDB();
    const filter = typeof userId === 'string' ? { _id: new ObjectId(userId) } : { _id: userId };
    await db.collection('users').updateOne(filter, { $set: { team: teamName } });

    res.sendSuccess(200, `Successfully joined team: ${teamName}`);
});

