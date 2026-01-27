import { getDB } from '../config/db.js';
import { GameModel, BallModel, OverModel } from '../models/gameModel.js';
import { ObjectId } from 'mongodb';
import { AppError } from '../utils/AppError.js';

/**
 * Start a new game
 * POST /api/games/start
 */
export const startGame = async (req) => {
    const { difficultyLevel, no_of_overs, totalRunsNeeded } = req.body;
    const user = req.user;
    const teamId = req.teamId; // Attached by checkUserTeamMembership middleware
    const db = getDB();

    // 2. Create a unique Match ID (Timestamp + Random suffix)
    const matchId = `MATCH${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;

    // 3. Prepare game data using the Model
    const newGame = GameModel({
        matchId,
        playerId: user._id,
        teamId,
        teamName: user.team, // Snapshot the team name at the time of game start
        difficultyLevel,
        no_of_overs,
        totalRunsNeeded
    });

    // 4. Save to Database
    const result = await db.collection('games').insertOne(newGame);

    return {
        statusCode: 201,
        message: 'Game started successfully',
        data: {
            gameId: result.insertedId,
            matchId: newGame.matchId,
            status: newGame.status,
            msg: "Game On! Good luck."
        }
    };
};

/**
 * Update score (Record a ball)
 * PATCH /api/games/update-score
 */
export const updateScore = async (req) => {
    const { matchId, runs, wicket, angle } = req.body;
    const userId = req.user._id;
    const db = getDB();

    // 1. Find the active game
    const game = await db.collection('games').findOne({
        matchId,
        playerId: userId,
        status: 'in-progress'
    });

    if (!game) {
        throw new AppError('Active game not found for this match ID', 404);
    }

    // 2. Determine current over and ball
    let currentOvers = game.overs || [];
    let lastOver = currentOvers[currentOvers.length - 1];

    // If no overs exist yet, or the last over is full (6 balls), create a new over
    if (!lastOver || lastOver.balls.length >= 6) {
        // Check if we have already reached the max overs
        if (currentOvers.length >= game.no_of_overs) {
            throw new AppError('Game already completed! All overs bowled.', 400);
        }

        const newOverNumber = currentOvers.length + 1;
        lastOver = OverModel(newOverNumber, []);
        currentOvers.push(lastOver);
    }

    // 3. Add the ball to the current over
    const ballNumber = lastOver.balls.length + 1;
    const newBall = BallModel(ballNumber, runs, wicket, angle);
    lastOver.balls.push(newBall);

    // 4. Calculate stats for status update
    let totalRuns = 0;
    let totalWickets = 0;
    currentOvers.forEach(o => {
        o.balls.forEach(b => {
            totalRuns += b.runs;
            if (b.wicket) totalWickets += 1;
        });
    });

    // 5. Check if game is finished
    let status = 'in-progress';
    let resultMessage = null;

    if (totalRuns >= game.totalRunsNeeded) {
        status = 'completed';
        resultMessage = 'Congratulations! You reached the target! 🏆';
    } else if (totalWickets >= 10) {
        status = 'completed';
        resultMessage = 'All Out! You lost all your wickets. 🏏';
    } else if (currentOvers.length === game.no_of_overs && lastOver.balls.length === 6) {
        status = 'completed';
        resultMessage = `Game Over! You needed ${game.totalRunsNeeded} runs, but scored ${totalRuns}. 🏏`;
    }

    // 6. Update database
    await db.collection('games').updateOne(
        { _id: game._id },
        {
            $set: {
                overs: currentOvers,
                status: status,
                updatedAt: new Date()
            }
        }
    );

    return {
        statusCode: 200,
        message: resultMessage || 'Score updated successfully',
        data: {
            currentStats: {
                totalRuns,
                totalWickets,
                oversBowled: `${currentOvers.length - (lastOver.balls.length === 6 ? 0 : 1)}.${lastOver.balls.length % 6}`,
                target: game.totalRunsNeeded
            },
            lastBall: newBall,
            status
        }
    };
};

/**
 * Get all games played by the user
 * GET /api/games/my-games
 */
export const getUserGames = async (req) => {
    const userId = req.user._id;
    const db = getDB();

    const games = await db.collection('games')
        .find({ playerId: userId })
        .sort({ createdAt: -1 })
        .toArray();

    return {
        statusCode: 200,
        message: 'Games retrieved successfully',
        results: games.length,
        data: {
            games
        }
    };
};
