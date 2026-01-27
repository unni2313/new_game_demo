import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { UserModel } from '../models/userModel.js';

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
export const registerUser = async (req) => {
    const { name, email, age, password, role } = req.body;

    // Use the Model to structure the data
    const newUser = UserModel({
        name,
        email,
        age,
        password,
        role
    });

    const db = getDB();
    const result = await db.collection('users').insertOne(newUser);

    const token = signToken(result.insertedId);

    // Return response (without password)
    return {
        statusCode: 201,
        message: 'User registered successfully',
        data: {
            userId: result.insertedId,
            token,
            name,
            email,
            age: Number(age),
            role: role || 'user'
        }
    };
};

/**
 * Login user
 * POST /api/users/login
 */
export const loginUser = async (req) => {
    const { password } = req.body;
    const user = req.user;

    // 1) Check if password is correct
    if (!(await bcrypt.compare(password, user.password))) {
        throw new AppError('Incorrect email or password', 401);
    }

    // 2) If everything ok, send token to client
    const token = signToken(user._id);

    return {
        statusCode: 200,
        message: 'Logged in successfully',
        data: {
            userId: user._id,
            token,
            name: user.name,
            email: user.email,
            role: user.role
        }
    };
};

/**
 * Get user profile
 * GET /api/users/profile
 */
export const getProfile = async (req) => {
    // The user is already attached to the request by the 'protect' middleware
    const user = req.user;
    const db = getDB();

    // Calculate total cumulative score from all games played by this user
    const scoreData = await db.collection('games').aggregate([
        { $match: { playerId: user._id } },
        { $unwind: { path: '$overs', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$overs.balls', preserveNullAndEmptyArrays: true } },
        {
            $group: {
                _id: null,
                totalScore: { $sum: '$overs.balls.runs' }
            }
        }
    ]).toArray();

    const totalScore = scoreData.length > 0 ? scoreData[0].totalScore : 0;

    return {
        statusCode: 200,
        message: 'User profile retrieved',
        data: {
            userId: user._id,
            name: user.name,
            email: user.email,
            age: user.age,
            role: user.role,
            team: user.team || 'No team joined yet',
            totalScore: totalScore,
            createdAt: user.createdAt
        }
    };
};

/**
 * Logout user
 * POST /api/users/logout
 */
export const logoutUser = async (req) => {
    // Note: Since we use JWT (stateless), 
    // real "logout" happens on the client by deleting the token.
    return {
        statusCode: 200,
        message: 'Logged out successfully! Please delete your token on the client side.'
    };
};

/**
 * Join a team
 * PATCH /api/users/join-team
 */
export const joinTeam = async (req) => {
    const { teamName } = req.body;
    const userId = req.user._id;

    const db = getDB();
    const filter = typeof userId === 'string' ? { _id: new ObjectId(userId) } : { _id: userId };
    await db.collection('users').updateOne(filter, { $set: { team: teamName } });

    return {
        statusCode: 200,
        message: `Successfully joined team: ${teamName}`
    };
};

