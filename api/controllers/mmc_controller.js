/**
 * @module
 * @desc Controllers for the Media Entertain Core (MMC) routes
 */

const action = require('../../services/api_actions/actions');
const { successResponse } = require('../responses/success_response');
const { errorResponse } = require('../responses/errors_response');
const { ApiError } = require('../../loaders/errors_loader');
const { serverError } = require('../responses/errors_response');

async function executeAction(actionFunc, params) {
    const { res } = params;
    try {
        const response = await actionFunc(params);
        const fullResponse = Object.assign(response, {
            applicationType: 'application/xml',
            res,
        });
        successResponse(fullResponse);
    } catch (error) {
        if (error instanceof ApiError) {
            const errResponse = Object.assign(error, {
                applicationType: 'application/xml',
                res,
            });
            return errorResponse(errResponse);
        }
        console.log(error);
        return serverError(res);
    }
    return {};
}

/**
 * Retrieve a specific MMC resource using http GET
 * If the resource exists the XML data will be returned, otherwise a 4XX error will be returned
 * @param req {object} - The express request object
 * @param res {object} - The express response object
 */

async function mmcGetResource(req, res) {
    const { contentId } = req.params; // The content id of the requested resource
    const { database } = this.dependencies; // The injected database interface
    
    const params = {
        database,
        resourceId: contentId,
        resourceType: 'mmc',
        applicationType: 'xml',
    };
    
    try {
        if (contentId.toLowerCase() === 'getcount') {
            // A count of the resources was requested
            const response = await action.countResource(params);
            const xmlResponse = '<?xml version="1.0" encoding="UTF-8"?>'
                + '<Response>'
                + `<Count>${response.resourceCount}</Count>`
                + `<ResourceType>${response.resourceType}</ResourceType>`
                + '</Response>';
            res.status(200)
                .type('application/xml')
                .send(xmlResponse);
        } else {
            // A contentID and request for the resource was submitted
            const response = await action.sendResource(params);
            res.status(200)
                .type(`application/${response.applicationType}`)
                .send(response.resource);
        }
    } catch (err) {
        if (err instanceof ApiError) {
            const errResponse = Object.assign(err, {
                applicationType: 'application/xml',
                res,
            });
            return errorResponse(errResponse);
        }
        console.log(err);
        return serverError(res);
    }
    return {};
}

/**
 * Add or put data (XML) for a new resource
 * @param req {object} - The express request object
 * @param res {object} - The express response object
 */
async function mmcPutResource(req, res) {
    const { contentId } = req.params; // The content id of the resource to add
    const { database } = this.dependencies; // The injected database interface
    console.log(`Update the resource for: ${contentId}`);
    
    const params = {
        database,
        resource: req.body, // The XML data to be added
        resourceId: contentId,
        resourceType: 'test',
        applicationType: 'xml',
        res,
    };
    return executeAction(action.updateResource, params);
}

/**
 * Delete data for a resource
 * @param req {object} - The express request object
 * @param res {object} - The express response object
 */
async function mmcDeleteResource(req, res) {
    const { contentId } = req.params; // The content id of the resource to be deleted
    const { database } = this.dependencies; // The injected database interface
    console.log(`Delete the resource for: ${contentId}`);
    
    const params = {
        database,
        resourceId: contentId,
        resourceType: 'test',
        applicationType: 'xml',
        res,
    };
    return executeAction(action.removeResource, params);
}

/**
 * Update data for an existing resource
 * @param req {object} - The express request object
 * @param res {object} - The express response object
 */
async function mmcPostResource(req, res) {
    const { contentId } = req.params;
    const { database } = this.dependencies;
    console.log(`Create the resource for: ${contentId}`);
    
    const params = {
        database,
        resource: req.body,
        resourceId: contentId,
        resourceType: 'test',
        applicationType: 'xml',
        res,
    };
    return executeAction(action.saveResource, params);
}

module.exports = {
    mmcGetResource,
    mmcPutResource,
    mmcDeleteResource,
    mmcPostResource,
};
