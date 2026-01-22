import { getDB } from '../config/db.js';
import { catchAsync } from '../utils/catchAsync.js';

/**
 * Create a new team
 * POST /api/teams
 */
export const createTeam = catchAsync(async (req, res, next) => {
    const { teamName, tagLine, scores, wins, draws, losts } = req.body;
    const db = getDB();
    const result = await db.collection('teams').insertOne({
        teamName,
        tagLine,
        scores: Number(scores || 0),
        wins: Number(wins || 0),
        draws: Number(draws || 0),
        losts: Number(losts || 0),
        createdAt: new Date()
    });

    res.sendSuccess(201, 'Team created successfully', {
        teamId: result.insertedId,
        teamName,
        tagLine
    });
});

/**
 * Get all teams
 * GET /api/teams
 */
export const getAllTeams = catchAsync(async (req, res, next) => {
    const db = getDB();
    const teams = await db.collection('teams').find().toArray();

    res.sendSuccess(200, 'Teams retrieved successfully', {
        count: teams.length,
        teams
    });
});
