import { getDB, connectDB } from './src/config/db.js';
import dotenv from 'dotenv';
import { ObjectId } from 'mongodb';
dotenv.config();

const test = async () => {
    await connectDB();
    const db = getDB();

    // Find a team first
    const team = await db.collection('teams').findOne({ teamName: 'Validated Team' });
    if (!team) {
        console.log("No teams found");
        process.exit(0);
    }

    console.log(`Checking stats for Team: ${team.teamName} (${team._id})`);

    const stats = await db.collection('games').aggregate([
        { $match: { teamId: team._id } },
        { $unwind: { path: '$overs', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$overs.balls', preserveNullAndEmptyArrays: true } },
        {
            $group: {
                _id: '$playerId',
                totalRuns: { $sum: { $ifNull: ['$overs.balls.runs', 0] } },
                gamesPlayed: { $addToSet: '$_id' }
            }
        },
        {
            $project: {
                playerId: '$_id',
                totalRuns: 1,
                gamesCount: { $size: '$gamesPlayed' }
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'playerId',
                foreignField: '_id',
                as: 'userDetails'
            }
        },
        { $unwind: '$userDetails' },
        {
            $project: {
                _id: 0,
                name: '$userDetails.name',
                email: '$userDetails.email',
                totalRuns: 1,
                gamesCount: 1
            }
        }
    ]).toArray();

    console.log("TEAM_MEMBERS_STATS_RESULTS:");
    console.log(JSON.stringify(stats, null, 2));
    process.exit(0);
};

test();
