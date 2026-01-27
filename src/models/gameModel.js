import { ObjectId } from 'mongodb';

/**
 * Game Structure
 * This defines the shape of a Game object in our application.
 */
export const GameModel = (data) => {
    return {
        matchId: data.matchId,
        playerId: data.playerId ? new ObjectId(data.playerId) : null,
        teamId: data.teamId ? new ObjectId(data.teamId) : null,
        teamName: data.teamName || null,
        difficultyLevel: data.difficultyLevel || 'medium',
        no_of_overs: Number(data.no_of_overs || 0),
        totalRunsNeeded: Number(data.totalRunsNeeded || 0),
        overs: data.overs || [], // Expected to be an array of objects
        status: data.status || 'in-progress',
        createdAt: new Date()
    };
};

/**
 * Helper to create a new Ball object structure
 */
export const BallModel = (ballNumber, runs, wicket, angle) => {
    return {
        ballNumber: Number(ballNumber),
        runs: Number(runs || 0),
        wicket: Boolean(wicket),
        angle: angle ? Number(angle) : null
    };
};

/**
 * Helper to create a new Over object structure
 */
export const OverModel = (overNumber, balls = []) => {
    return {
        overNumber: Number(overNumber),
        balls: balls // Array of Ball objects
    };
};
