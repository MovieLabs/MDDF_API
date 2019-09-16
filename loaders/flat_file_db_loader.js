/**
 * @desc Instantiate a database to use for the API
 * @type {{find, save, count, create, dir, remove}|*}
 */

const database = require('../models/flat_file_db/database');
const config = require('../config');

module.exports = async function flatFileDb() {
    const db = await database.create(config.db);
    console.log('Database initialized');
    return db;
};
