import { getDB } from '../config/db.js';
import { TeamModel } from '../models/teamModel.js';
import { ObjectId } from 'mongodb';

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

/**
 * Get team members and their cumulative score for a specific team
 * POST /api/teams/members
 */
export const getTeamMembersStats = async (req) => {
    const { teamId } = req.body;
    const db = getDB();

    const stats = await db.collection('games').aggregate([
        {
            $match: {
                teamId: typeof teamId === 'string' ? new ObjectId(teamId) : teamId
            }
        },
        // Unwind overs and balls to count every run
        { $unwind: { path: '$overs', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$overs.balls', preserveNullAndEmptyArrays: true } },
        // Group by player to get their total runs for THIS team
        {
            $group: {
                _id: '$playerId',
                totalRuns: { $sum: { $ifNull: ['$overs.balls.runs', 0] } },
                gamesPlayed: { $addToSet: '$_id' } // Use $addToSet on game _id to count unique games
            }
        },
        // Calculate number of games from the set
        {
            $project: {
                playerId: '$_id',
                totalRuns: 1,
                gamesCount: { $size: '$gamesPlayed' }
            }
        },
        // Lookup user details
        {
            $lookup: {
                from: 'users',
                localField: 'playerId',
                foreignField: '_id',
                as: 'userDetails'
            }
        },
        { $unwind: '$userDetails' },
        // Final project for clean output
        {
            $project: {
                _id: 0,
                playerId: 1,
                name: '$userDetails.name',
                email: '$userDetails.email',
                totalRuns: 1,
                gamesCount: 1
            }
        },
        { $sort: { totalRuns: -1 } }
    ]).toArray();

    return {
        statusCode: 200,
        message: 'Team member statistics retrieved successfully',
        data: {
            teamId,
            members: stats
        }
    };
};
