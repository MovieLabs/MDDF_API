/**
 * @module
 * @desc Initialize the application
 * @type {*}
 */

const express = require('./express_loader');
const database = require('./flat_file_db_loader');
const swagger = require('./swagger_loader');

module.exports = async function startApi(depend) {
    const dependencies = Object.assign({}, depend);

    await express(dependencies); // Initialize Express
    dependencies.database = await database(dependencies); // Setup the database of choice
    await swagger(dependencies); // Initialize Swagger and the routes using the Open API spec
    return dependencies;
};
