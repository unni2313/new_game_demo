import { Team } from '../models/teamModel.js';
import { catchAsync } from '../utils/catchAsync.js';

/**
 * Create a new team
 * POST /api/teams
 */
export const createTeam = catchAsync(async (req, res, next) => {
    const { teamName, tagLine, scores, wins, draws, losts } = req.body;

    const result = await Team.create({
        teamName,
        tagLine,
        scores: Number(scores || 0),
        wins: Number(wins || 0),
        draws: Number(draws || 0),
        losts: Number(losts || 0)
    });

    res.status(201).json({
        status: 'success',
        message: 'Team created successfully',
        data: {
            teamId: result.insertedId,
            teamName,
            tagLine
        }
    });
});

/**
 * Get all teams
 * GET /api/teams
 */
export const getAllTeams = catchAsync(async (req, res, next) => {
    const teams = await Team.findAll();

    res.status(200).json({
        status: 'success',
        results: teams.length,
        data: {
            teams
        }
    });
});
