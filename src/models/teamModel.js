import { getDB } from '../config/db.js';

export const Team = {
    async create(teamData) {
        const db = getDB();
        const result = await db.collection('teams').insertOne({
            ...teamData,
            createdAt: new Date()
        });
        return result;
    },

    async findAll() {
        const db = getDB();
        return await db.collection('teams').find().toArray();
    },

    /**
     * Find a team by its name
     * @param {string} teamName 
     * @returns {Promise<Object|null>}
     */
    async findByName(teamName) {
        const db = getDB();
        return await db.collection('teams').findOne({ teamName });
    }
};
