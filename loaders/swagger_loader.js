/**
 * @module
 * @desc Initialize the routes using Swagger and the stubs from the open API definition
 * @type {module:path}
 */

const path = require('path');
const { initialize } = require('express-openapi');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const mecController = require('../api/controllers/mec_controller');
const mmcController = require('../api/controllers/mmc_controller');
const artworkController = require('../api/controllers/artwork_controller');
const mecMapController = require('../api/controllers/mec_map_controller');
const searchController = require('../api/controllers/search_controller');

module.exports = async function swagger(dependencies) {
    const { expressApp, database } = dependencies;
    const apiDoc = path.join(__dirname, '../api/docs-v1/mddf-api-doc.yaml');
    const swaggerDocument = yaml.load(apiDoc);
    expressApp.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    initialize({
        app: expressApp,
        apiDoc,
        dependencies: {
            database,
        },
        operations: {
            mecGetCount: await mecController.mecGetResource,
            mecGetResource: await mecController.mecGetResource,
            mecPostResource: await mecController.mecPostResource,
            mecPutResource: await mecController.mecPutResource,
            mecDeleteResource: await mecController.mecDeleteResource,
            mmcGetCount: mmcController.mmcGetResource,
            mmcGetResource: mmcController.mmcGetResource,
            mmcPostResource: mmcController.mmcPostResource,
            mmcPutResource: mmcController.mmcPutResource,
            mmcDeleteResource: mmcController.mmcDeleteResource,
            artworkGetResource: artworkController.artGetResource,
            mecMapResource: mecMapController.mecMapResource,
            searchTitles: searchController.getSearch,
        },
    });
    console.log('API Endpoints initialized');
    return {};
};
