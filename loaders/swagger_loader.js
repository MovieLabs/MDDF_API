/**
 * @module
 * @desc Initialize the routes using Swagger and the stubs from the open API definition
 * @type {module:path}
 */

const createError = require('http-errors');
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
            mmcGetCount: await mmcController.mmcGetResource,
            mmcGetResource: await mmcController.mmcGetResource,
            mmcPostResource: await mmcController.mmcPostResource,
            mmcPutResource: await mmcController.mmcPutResource,
            mmcDeleteResource: await mmcController.mmcDeleteResource,
            artworkGetResource: await artworkController.artGetResource,
            mecMapResource: await mecMapController.mecMapResource,
            searchTitles: await searchController.getSearch,
        },
    });
    console.log('API Endpoints initialized');

    // catch 404 and forward to error handler
    expressApp.use((req, res, next) => {
        next(createError(404));
    });

    // error handler
    expressApp.use((err, req, res) => {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
    });

    return {};
};
