/**
 * @module
 * @desc A set of methods for executing API actions that are applicable across multiple resources
 * @param saveResource {function} - Save a resource to the database if it does not already exist
 * @param updateResource {function} - Update an existing resource if in the database
 * @param removeResource {function} - Delete an existing resource if in the database
 * @param sendResource {function} - Send the data for a resource if in the database
 * @param countResource {function} - Return a count of all a particular resource type
 */

const validate = require('../../helpers/validate');
const { ApiError } = require('../../loaders/errors_loader');

/**
 * Save a resource
 *
 * @param params
 * @param params.database {object} - The database module
 * @param params.resourceType {string} - The type of resource to save [mec, mmc, avails, artwork]
 * @param params.resourceId {string} - The resource Id for the asset being saved
 * @param params.applicationType {string} - The format of the content (generally XML)
 * @returns {Promise<void>}
 */
async function saveResource(params) {
    const {
        database,
        resource,
        resourceId,
        resourceType,
    } = params;

    // Check for body of the content for the id, and ensure it matches the resourceId
    const id = validate[resourceType](resource);
    if (id !== resourceId) {
        throw new ApiError({
            status: 422,
            message: 'ContentId does not match the contentId in the resource body',
        });
    }
    // If the resource already exists, send an error
    if (await database.exists(params)) {
        throw new ApiError({
            status: 409,
            message: 'Conflict: Resource already exists',
        });
    }

    try {
        // Create a legal filename for the resource, use everything right of the last colon
        params.fileName = `${resourceId.split(':').pop()}.xml`;
        // Otherwise request the database to save the resource
        await database.save(params); // Save the resource data
        return {
            status: 201,
            message: 'Successful: Resource created',
        };
    } catch (err) {
        // Return a general purpose failure if something else went wrong
        throw new ApiError({
            status: 500,
            message: 'Failed: Database problem',
        });
    }
}

/**
 * Update a resource

 * @param params
 * @param params.database {object} - The database module
 * @param params.resourceType {string} - The type of resource to update [mec, mmc, avails, artwork]
 * @param params.resourceId {string} - The resource Id for the asset being saved
 * @param params.applicationType {string} - The format of the content (generally XML)
 * @returns {Promise<{message: string, status: number}>}
 */
async function updateResource(params) {
    const { database, resourceId } = params;

    // If the resource already exists, send an error
    if (!await database.exists(params)) {
        throw new ApiError({
            status: 404,
            message: 'Failed: Resource not found',
        });
    }

    try {
        // Create a legal filename for the resource from everything after the last colon
        params.fileName = `${resourceId.split(':').pop()}.xml`;
        // Otherwise request the database to save the resource
        await database.save(params); // Save the resource data
        return {
            status: 200,
            message: 'Successful: Resource updated',
        };
    } catch (err) {
        // Return a general purpose failure if something else went wrong
        throw new ApiError({
            status: 400,
            message: 'Failed: Update failed, database problem',
        });
    }
}

/**
 * Remove a resource
 *
 * @param params
 * @param params.database {object} - The database module
 * @param params.resourceType {string} - The type of resource to remove [mec, mmc, avails, artwork]
 * @param params.resourceId {string} - The resource Id for the asset being saved
 * @param params.applicationType {string} - The format of the content (generally XML)
 * @returns {Promise<void>}
 */
async function removeResource(params) {
    const { database } = params;

    // If the resource does not exist, send an error
    if (!await database.exists(params)) {
        throw new ApiError({
            status: 400,
            message: 'Failed: Resource not found',
        });
    }

    try {
        // Delete the resource data
        database.remove(params);
        return {
            status: 200,
            message: 'Successful: Resource deleted',
        };
    } catch (err) {
        // Throw a general purpose failure if something else went wrong
        throw new ApiError({
            status: 500,
            message: 'Failed: Database problem',
        });
    }
}

/**
 * Update a resource
 * @param params
 * @param params.database {object} - The database module
 * @param params.resourceType {string} - The type of resource to update [mec, mmc, avails, artwork]
 * @param params.resourceId {string} - The resource Id for the asset being saved
 * @param params.applicationType {string} - The format of the content (generally XML)
 * @returns {Promise<{applicationType: *, resource: *, status: number}>}
 */
async function sendResource(params) {
    const {
        database,
        applicationType,
    } = params;

    try {
        const resource = await database.find(params);
        return {
            status: 200,
            applicationType,
            message: 'Success',
            resource,
        };
    } catch (err) {
        throw new ApiError({
            status: 404,
            message: 'Failed: Resource not found',
        });
    }
}

/**
 * Get a count of all resources
 * @param params
 * @param params.resourceType {string} - The type of resource to count [mec, mmc, avails, artwork]
 * @param params.database {object} - The database module
 * @returns {Promise<{resourceCount: *, resourceType: *}>}
 */
async function countResource(params) {
    const { resourceType, database } = params;
    console.log('Starting the countResource method');
    try {
        const resourceCount = await database.count(params);
        return {
            resourceCount,
            resourceType,
        };
    } catch (err) {
        throw new ApiError({
            status: 500,
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
