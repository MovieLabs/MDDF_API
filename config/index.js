/**
 * @module
 * @desc A configuration object, including all the process.env variables
 */

// If PM2 has not injected the environment variables, load from local .env file
const dotenv = require('dotenv');

if (!process.env.NODE_ENV) {
    console.log('No environment loaded, load from local directory');
    dotenv.config();
}

const flatFileDb = require('./flat_file_db_config'); // Configuration for the flat file database

module.exports = {
    port: process.env.PORT || 4020,
    db: flatFileDb,
};
