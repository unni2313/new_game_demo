import { MongoClient } from 'mongodb';

let db = null;
let client = null;

/**
 * Connect to MongoDB using the native driver
 */
export const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }

        client = new MongoClient(uri);
        await client.connect();

        // Extract database name from URI or use default
        const dbName = new URL(uri).pathname.slice(1) || 'gameDB';
        db = client.db(dbName);

        console.log(`MongoDB Connected: ${dbName}`);
        return db;
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
};

/**
 * Get the database instance
 */
export const getDB = () => {
    if (!db) {
        throw new Error('Database not initialized. Call connectDB first.');
    }
    return db;
};

/**
 * Close the database connection gracefully
 */
export const closeDB = async () => {
    if (client) {
        await client.close();
        console.log('MongoDB connection closed.');
    }
};
