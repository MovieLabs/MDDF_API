/**
 * @module
 * @desc A set of methods for executing API actions that are applicable across multiple resources
 * @param saveResource {function} - Save a resource to the database if it does not already exist
 * @param updateResource {function} - Update an existing resource if in the database
 * @param removeResource {function} - Delete an existing resource if in the database
 * @param sendResource {function} - Send the data for a resource if in the database
 * @param countResource {function} - Return a count of all a particular resource type
 */

const validate = require('./validate');

/**
 * Send a success response formatted in XML, when there is no specific payload
 * @param response
 * @param response.res {object} - The express response object
 * @param response.responseCode {number} - The HTTP status code, and error code
 * @param response.message {string} - The error message
 * @param response.moreInfo {string} - Optional useful information for the user
 */
function successResponse(response) {
    const { res, responseCode, message } = response;
    let xmlMessage = '<?xml version="1.0" encoding="UTF-8"?>'
        + '<Response>'
        + `<ResponseCode>${responseCode}</ResponseCode>`
        + `<Message>${message}</message>`
        + `<Resource>${res.req.url}</Resource>`;
    xmlMessage += response.hasOwnProperty('moreInfo') ? `<MoreInfo>${response.moreInfo}</MoreInfo>` : '';
    xmlMessage += '</Response>';

    res.status(responseCode)
       .type('application/xml')
       .send(xmlMessage);
}

/**
 * Send an error response formatted in XML
 * @param errResponse
 * @param errResponse.res {object} - The express response object
 * @param errResponse.errorCode {number} - The HTTP status code, and error code
 * @param errResponse.message {string} - The error message
 * @param errResponse.moreInfo {string} - Optional useful information for the user
 */
function errorResponse(errResponse) {
    const { res, errorCode, message } = errResponse;
    let xmlMessage = '<?xml version="1.0" encoding="UTF-8"?>'
        + '<Error>'
        + `<errorCode>${errorCode}</errorCode>`
        + `<message>${message}</message>`
        + `<Resource>${res.req.url}</Resource>`;
    xmlMessage += errResponse.hasOwnProperty('moreInfo') ? `<MoreInfo>${errResponse.moreInfo}</MoreInfo>` : '';
    xmlMessage += '</Error>';

    res.status(errorCode)
       .type('application/xml')
       .send(xmlMessage);
}


// Return a list of the existing resources for the resource type supplied
async function getExistingResources(params) {
    const { database } = params;
    return database.dir(params);
}

/**
 * Save a resource
 *
 * @param params
 * @param params.res {object} - The express response object
 * @param params.database {object} - The database module
 * @param params.resourceType {string} - The type of resource to save [mec, mmc, avails, artwork]
 * @param params.resourceId {string} - The resource Id for the asset being saved
 * @param params.applicationType {string} - The format of the content (generally XML)
 * @returns {Promise<void>}
 */
async function saveResource(params) {
    const {
        res,
        database,
        resource,
        resourceId,
        resourceType,
        applicationType,
    } = params;

    try {
        // Check for body of the content for the id, and ensure it matches the resourceId
        const id = validate[resourceType](resource);
        if (id !== resourceId) {
            return errorResponse({
                res,
                errorCode: 422,
                message: 'ContentId does not match the contentId in the resource body',
            });
        }
        // If the resource already exists, send an error
        if (await database.exists(params)) {
            return errorResponse({
                res,
                errorCode: 409,
                message: 'Conflict: Resource already exists',
            });
        }
        // Create a legal filename for the resource from everything after the last colon
        params.fileName = `${resourceId.split(':').pop()}.xml`;
        // Otherwise request the database to save the resource
        await database.save(params); // Save the resource data
        return successResponse({
            res,
            responseCode: 201,
            message: 'Successful: Resource created',
        });
    } catch (err) {
        // Return a general purpose failure if something else went wrong
        console.log(err);
        return errorResponse({
            res,
            errorCode: 500,
            message: 'Failed: Database problem',
        });
    }
}

/**
 * Update a resource

 * @param params
 * @param params.res {object} - The express response object
 * @param params.database {object} - The database module
 * @param params.resourceType {string} - The type of resource to update [mec, mmc, avails, artwork]
 * @param params.resourceId {string} - The resource Id for the asset being saved
 * @param params.applicationType {string} - The format of the content (generally XML)
 * @returns {Promise<void>}
 */
async function updateResource(params) {
    const {
        res,
        database,
        resourceId,
    } = params;

    try {
        // If the resource already exists, send an error
        if (!await database.exists(params)) {
            return errorResponse({
                res,
                errorCode: 404,
                message: 'Failed: Resource not found',
            });
        }
        // Create a legal filename for the resource from everything after the last colon
        params.fileName = `${resourceId.split(':').pop()}.xml`;
        // Otherwise request the database to save the resource
        await database.save(params); // Save the resource data
        return successResponse({
            res,
            responseCode: 200,
            message: 'Successful: Resource updated',
        });
    } catch (err) {
        // Return a general purpose failure if something else went wrong
        return errorResponse({
            res,
            errorCode: 400,
            message: 'Failed: Update failed, database problem',
        });
    }
}

/**
 * Remove a resource
 *
 * @param params
 * @param params.res {object} - The express response object
 * @param params.database {object} - The database module
 * @param params.resourceType {string} - The type of resource to remove [mec, mmc, avails, artwork]
 * @param params.resourceId {string} - The resource Id for the asset being saved
 * @param params.applicationType {string} - The format of the content (generally XML)
 * @returns {Promise<void>}
 */
async function removeResource(params) {
    const {
        res,
        database,
    } = params;

    try {
        // If the resource does not exist, send an error
        if (!await database.exists(params)) {
            return errorResponse({
                res,
                errorCode: 204,
                message: 'Failed: No Content',
            });
        }

        // Delete the resource data
        database.remove(params);
        return successResponse({
            res,
            responseCode: 200,
            message: 'Successful: Resource deleted',
        });
    } catch (err) {
        // Return a general purpose failure if something else went wrong
        return errorResponse({
            res,
            errorCode: 400,
            message: 'Failed: Delete failed, database problem',
        });
    }
}

/**
 * Update a resource
 * @param params
 * @param params.res {object} - The express response object
 * @param params.database {object} - The database module
 * @param params.resourceType {string} - The type of resource to update [mec, mmc, avails, artwork]
 * @param params.resourceId {string} - The resource Id for the asset being saved
 * @param params.applicationType {string} - The format of the content (generally XML)
 * @returns {Promise<void>}
 */
async function sendResource(params) {
    const {
        res,
        database,
        applicationType,
    } = params;

    try {
        const resourceXML = await database.find(params);
        res.status(200)
           .type(`application/${applicationType}`)
           .send(resourceXML);
    } catch (err) {
        return errorResponse({
            res,
            errorCode: 404,
            message: 'Failed: Resource not found',
        });
    }
}

/**
 * Get a count of all resources
 * @param params
 * @param params.res {object} - The express response object
 * @param params.resourceType {string} - The type of resource to count [mec, mmc, avails, artwork]
 * @param params.database {object} - The database module
 * @returns {Promise<void>}
 */
async function countResource(params) {
    const { res, resourceType, database } = params;
    console.log('Starting the countResource method');
    try {
        const resourceCount = await database.count(params);
        const response = '<?xml version="1.0" encoding="UTF-8"?>'
            + '<Response>'
            + `<Count>${resourceCount}</Count>`
            + `<ResourceType>${resourceType}</ResourceType>`
        + '</Response>';
        res.status(200)
           .type('application/xml')
           .send(response);
        console.log('Finished with the response');
    } catch (err) {
        return errorResponse({
            res,
            errorCode: 500,
            message: 'Failed: Database problem',
        });
    }
}

module.exports = {
    saveResource,
    updateResource,
    removeResource,
    sendResource,
    countResource,
};