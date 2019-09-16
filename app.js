/**
 * @module
 * @desc The primary entry point for MDDF API application
 * @type {createApplication}
 */

const express = require('express');
const config = require('./config');
const loaders = require('./loaders');

const { port } = config;

async function initApplication() {
    const app = express();
    await loaders.init({ expressApp: app }); // Initialize the Express & the API

    // Open up the port, then everything is ready to go.
    app.listen(port, (err) => {
        if (err) {
            console.log(err);
            return;
        }
        console.log('The API is ready');
    });
}

initApplication();
