import { getDB } from '../config/db.js';
import { TeamModel } from '../models/teamModel.js';

/**
 * Create a new team
 * POST /api/teams
 */
export const createTeam = async (req) => {
    const { teamName, tagLine, scores, wins, draws, losts } = req.body;

    // Prepare data using the model structure
    const newTeam = TeamModel({
        teamName,
        tagLine,
        scores,
        wins,
        draws,
        losts
    });

    const db = getDB();
    const result = await db.collection('teams').insertOne(newTeam);

    return {
        statusCode: 201,
        message: 'Team created successfully',
        data: {
            teamId: result.insertedId,
            teamName,
            tagLine
        }
    };
};

/**
 * Get all teams
 * GET /api/teams
 */
export const getAllTeams = async (req) => {
    const db = getDB();
    const teams = await db.collection('teams').find().toArray();

    return {
        statusCode: 200,
        message: 'Teams retrieved successfully',
        data: {
            count: teams.length,
            teams
        }
    };
};
