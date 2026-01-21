import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';

/**
 * User model for direct database interactions
 */
export const User = {
    /**
     * Create a new user in the database
     * @param {Object} userData - User details (name, email, age, password)
     * @returns {Promise<Object>} The result of the insertion
     */
    async create(userData) {
        const db = getDB();
        const result = await db.collection('users').insertOne({
            ...userData,
            role: userData.role || 'user',
            createdAt: new Date()
        });
        return result;
    },

    /**
     * Find a user by their email address
     * @param {string} email - The email to search for
     * @returns {Promise<Object|null>} The user document if found, otherwise null
     */
    async findByEmail(email) {
        const db = getDB();
        return await db.collection('users').findOne({ email });
    },

    /**
     * Find a user by their ID
     * @param {string} id - The user ID string
     * @returns {Promise<Object|null>}
     */
    async findById(id) {
        const db = getDB();
        try {
            return await db.collection('users').findOne({ _id: new ObjectId(id) });
        } catch (err) {
            return null;
        }
    },

    /**
     * Get a reference to the users collection
     * @returns {Collection}
     */
    getCollection() {
        return getDB().collection('users');
    }
};
